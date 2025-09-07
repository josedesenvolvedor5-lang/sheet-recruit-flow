import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export interface Candidate {
  id?: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  position: string;
  experience: string;
  motivation: string;
  resumeUrl?: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  currentStage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id?: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'intern';
  status: 'open' | 'closed' | 'draft';
  description: string;
  requirements: string[];
  salary?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Stage {
  id?: string;
  name: string;
  description: string;
  order: number;
  duration: number; // em dias
  createdAt: Date;
}

export const useFirebase = () => {
  const { toast } = useToast();

  // Candidates
  const addCandidate = async (candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'candidates'), {
        ...candidateData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      toast({ title: "Candidato adicionado com sucesso!" });
      return docRef.id;
    } catch (error) {
      console.error('Error adding candidate:', error);
      toast({ title: "Erro ao adicionar candidato", variant: "destructive" });
      throw error;
    }
  };

  const getCandidates = async (): Promise<Candidate[]> => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'candidates'), orderBy('createdAt', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Candidate[];
    } catch (error) {
      console.error('Error getting candidates:', error);
      toast({ title: "Erro ao carregar candidatos", variant: "destructive" });
      return [];
    }
  };

  const updateCandidate = async (id: string, updates: Partial<Candidate>) => {
    try {
      await updateDoc(doc(db, 'candidates', id), {
        ...updates,
        updatedAt: Timestamp.now()
      });
      toast({ title: "Candidato atualizado com sucesso!" });
    } catch (error) {
      console.error('Error updating candidate:', error);
      toast({ title: "Erro ao atualizar candidato", variant: "destructive" });
      throw error;
    }
  };

  const deleteCandidate = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'candidates', id));
      toast({ title: "Candidato removido com sucesso!" });
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast({ title: "Erro ao remover candidato", variant: "destructive" });
      throw error;
    }
  };

  // Jobs
  const addJob = async (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'jobs'), {
        ...jobData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      toast({ title: "Vaga criada com sucesso!" });
      return docRef.id;
    } catch (error) {
      console.error('Error adding job:', error);
      toast({ title: "Erro ao criar vaga", variant: "destructive" });
      throw error;
    }
  };

  const getJobs = async (): Promise<Job[]> => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'jobs'), orderBy('createdAt', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Job[];
    } catch (error) {
      console.error('Error getting jobs:', error);
      toast({ title: "Erro ao carregar vagas", variant: "destructive" });
      return [];
    }
  };

  const updateJob = async (id: string, updates: Partial<Job>) => {
    try {
      await updateDoc(doc(db, 'jobs', id), {
        ...updates,
        updatedAt: Timestamp.now()
      });
      toast({ title: "Vaga atualizada com sucesso!" });
    } catch (error) {
      console.error('Error updating job:', error);
      toast({ title: "Erro ao atualizar vaga", variant: "destructive" });
      throw error;
    }
  };

  // Stages
  const addStage = async (stageData: Omit<Stage, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'stages'), {
        ...stageData,
        createdAt: Timestamp.now()
      });
      toast({ title: "Etapa criada com sucesso!" });
      return docRef.id;
    } catch (error) {
      console.error('Error adding stage:', error);
      toast({ title: "Erro ao criar etapa", variant: "destructive" });
      throw error;
    }
  };

  const getStages = async (): Promise<Stage[]> => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'stages'), orderBy('order', 'asc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Stage[];
    } catch (error) {
      console.error('Error getting stages:', error);
      toast({ title: "Erro ao carregar etapas", variant: "destructive" });
      return [];
    }
  };

  // File upload
  const uploadResume = async (file: File, candidateId: string): Promise<string> => {
    try {
      const fileRef = ref(storage, `resumes/${candidateId}/${file.name}`);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({ title: "Erro ao fazer upload do arquivo", variant: "destructive" });
      throw error;
    }
  };

  // Real-time listeners
  const useCandidatesRealtime = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = onSnapshot(
        query(collection(db, 'candidates'), orderBy('createdAt', 'desc')),
        (snapshot) => {
          const candidatesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date()
          })) as Candidate[];
          setCandidates(candidatesData);
          setLoading(false);
        },
        (error) => {
          console.error('Error listening to candidates:', error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    }, []);

    return { candidates, loading };
  };

  return {
    // Candidates
    addCandidate,
    getCandidates,
    updateCandidate,
    deleteCandidate,
    useCandidatesRealtime,
    // Jobs
    addJob,
    getJobs,
    updateJob,
    // Stages
    addStage,
    getStages,
    // Files
    uploadResume
  };
};