import React, { useState, useEffect } from 'react';
import { User, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion } from 'motion/react';
import { ArrowLeft, Camera, Loader2, Check } from 'lucide-react';
import { playHaptic } from '../lib/haptics';

interface EditProfileProps {
  user: User;
  onBack: () => void;
}

export default function EditProfile({ user, onBack }: EditProfileProps) {
  const [name, setName] = useState(user.displayName || '');
  const [username, setUsername] = useState((user.displayName || '').toLowerCase().replace(/\s+/g, '_'));
  const [bio, setBio] = useState('Aspiring astrophysicist 🚀 | Science enthusiast 🔬');
  const [website, setWebsite] = useState('https://linktr.ee/vexox_rahul');
  const [gender, setGender] = useState('male');
  const [dob, setDob] = useState('2008-05-15');
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(user.photoURL);
  const [bannerPreview, setBannerPreview] = useState<string | null>("https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.username) setUsername(data.username);
          if (data.bio) setBio(data.bio);
          if (data.website) setWebsite(data.website);
          if (data.gender) setGender(data.gender);
          if (data.dob) setDob(data.dob);
          if (data.bannerURL) setBannerPreview(data.bannerURL);
        }
      } catch (error) {
        // Ignored for now
      }
    };
    fetchProfile();
  }, [user]);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPhotoFile(e.target.files[0]);
      const url = URL.createObjectURL(e.target.files[0]);
      setPhotoPreview(url);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setBannerFile(e.target.files[0]);
      const url = URL.createObjectURL(e.target.files[0]);
      setBannerPreview(url);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    playHaptic();
    setLoading(true);
    try {
      let finalPhotoURL = user.photoURL;
      let finalBannerURL = bannerPreview && bannerPreview.startsWith('http') ? bannerPreview : null;
      
      if (photoFile) {
        const storageRef = ref(storage, `profiles/${user.uid}/avatar_${Date.now()}`);
        await uploadBytes(storageRef, photoFile);
        finalPhotoURL = await getDownloadURL(storageRef);
      }
      
      if (bannerFile) {
        const storageRef = ref(storage, `profiles/${user.uid}/banner_${Date.now()}`);
        await uploadBytes(storageRef, bannerFile);
        finalBannerURL = await getDownloadURL(storageRef);
      }

      const updates: any = {};
      if (name.trim() !== user.displayName) updates.displayName = name.trim();
      if (finalPhotoURL && finalPhotoURL !== user.photoURL) updates.photoURL = finalPhotoURL;
      
      if (Object.keys(updates).length > 0) {
        await updateProfile(user, updates);
      }
      
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        fullName: name.trim() || user.displayName,
        username,
        bio,
        website,
        gender,
        dob,
        profilePictureUrl: finalPhotoURL || user.photoURL,
        bannerURL: finalBannerURL,
        updatedAt: new Date()
      }, { merge: true });

      alert("Profile updated successfully!");
      onBack();
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto px-4 pt-8 pb-32 min-h-screen"
    >
      <div className="flex items-center gap-4 mb-8 sticky top-0 bg-amethyst-900/80 backdrop-blur-md py-4 z-20 -mx-4 px-4">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white transition-colors active:scale-95">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-display font-bold text-white flex-1">Edit Profile</h2>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-amethyst-600 hover:bg-amethyst-500 text-white px-4 py-2 rounded-full font-bold text-sm transition-colors active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
        </button>
      </div>

      <div className="glass-amethyst rounded-3xl p-6">
        {/* Banner & Avatar Edit */}
        <div className="relative mb-16">
          <label className="block h-32 bg-amethyst-800 rounded-2xl overflow-hidden relative group cursor-pointer">
             <img src={bannerPreview || "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800"} alt="Banner" className="w-full h-full object-cover opacity-60" />
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Camera className="w-8 h-8 text-white" />
             </div>
             <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
          </label>
          
          <label className="absolute -bottom-12 left-6 w-24 h-24 bg-amethyst-900 rounded-full border-4 border-amethyst-500 flex items-center justify-center overflow-hidden group cursor-pointer z-10 block">
            {photoPreview ? (
              <img src={photoPreview} alt="User" className="w-full h-full object-cover" />
            ) : (
               <span className="text-3xl text-white font-bold">{name.charAt(0) || 'V'}</span>
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Camera className="w-6 h-6 text-white" />
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
           <div>
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Name</label>
             <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amethyst-500 focus:outline-none transition-colors" />
           </div>
           
           <div>
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Username</label>
             <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amethyst-500 focus:outline-none transition-colors font-mono text-sm" />
           </div>

           <div>
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bio</label>
             <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amethyst-500 focus:outline-none transition-colors resize-none" />
           </div>

           <div>
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Links</label>
             <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amethyst-500 focus:outline-none transition-colors" />
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
               <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amethyst-500 focus:outline-none transition-colors appearance-none">
                 <option value="male">Male</option>
                 <option value="female">Female</option>
                 <option value="other">Other</option>
                 <option value="prefer_not">Prefer not to say</option>
               </select>
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date of Birth</label>
               <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amethyst-500 focus:outline-none transition-colors [color-scheme:dark]" />
             </div>
           </div>
        </form>
      </div>
    </motion.div>
  );
}
