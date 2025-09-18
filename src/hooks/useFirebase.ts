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
  level?: 'junior' | 'mid' | 'senior' | 'lead';
  status: 'open' | 'closed' | 'draft';
  description: string;
  requirements: string[];
  benefits?: string;
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

export interface CandidateStage {
  id: string;
  candidateId: string;
  stageId: string;
  stageName: string;
  status: 'completed' | 'current' | 'pending';
  score?: number;
  feedback?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CandidateNote {
  id?: string;
  candidateId: string;
  note: string;
  createdAt: Date;
  createdBy?: string;
}

export interface Batch {
  id?: string;
  name: string;
  jobTitle: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  maxCandidates: number;
  currentCandidates: number;
  completionRate: number;
  averageTime: number;
  createdAt: Date;
}

export const useFirebase = () => {
  const { toast } = useToast();

  // Candidates
  const addCandidate = async (candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('Adicionando candidato:', candidateData);
      const docRef = await addDoc(collection(db, 'candidates'), {
        ...candidateData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      console.log('Candidato adicionado com ID:', docRef.id);
      
      // Initialize candidate stages only if stages exist
      try {
        await initializeCandidateStages(docRef.id);
      } catch (stageError) {
        console.warn('Erro ao inicializar etapas do candidato:', stageError);
      }
      
      toast({ title: "Candidato adicionado com sucesso!" });
      return docRef.id;
    } catch (error) {
      console.error('Error adding candidate:', error);
      toast({ 
        title: "Erro ao adicionar candidato", 
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive" 
      });
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

  const deleteJob = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'jobs', id));
      toast({ title: "Vaga removida com sucesso!" });
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({ title: "Erro ao remover vaga", variant: "destructive" });
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

// Add updateStage function to Firebase hook
const updateStage = async (id: string, updates: Partial<Stage>) => {
  try {
    await updateDoc(doc(db, 'stages', id), updates);
    toast({ title: "Etapa atualizada com sucesso!" });
  } catch (error) {
    console.error('Error updating stage:', error);
    toast({ title: "Erro ao atualizar etapa", variant: "destructive" });
    throw error;
  }
};

const deleteStage = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'stages', id));
    toast({ title: "Etapa removida com sucesso!" });
  } catch (error) {
    console.error('Error deleting stage:', error);
    toast({ title: "Erro ao remover etapa", variant: "destructive" });
    throw error;
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

  // Candidate Stages
  const addCandidateStage = async (stageData: Omit<CandidateStage, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'candidateStages'), {
        ...stageData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      toast({ title: "Etapa do candidato adicionada!" });
      return docRef.id;
    } catch (error) {
      console.error('Error adding candidate stage:', error);
      toast({ title: "Erro ao adicionar etapa", variant: "destructive" });
      throw error;
    }
  };

  const updateCandidateStage = async (id: string, updates: Partial<CandidateStage>) => {
    try {
      await updateDoc(doc(db, 'candidateStages', id), {
        ...updates,
        updatedAt: Timestamp.now()
      });
      toast({ title: "Etapa atualizada com sucesso!" });
    } catch (error) {
      console.error('Error updating candidate stage:', error);
      toast({ title: "Erro ao atualizar etapa", variant: "destructive" });
      throw error;
    }
  };

  const getCandidateStages = async (candidateId: string): Promise<CandidateStage[]> => {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, 'candidateStages'), 
          where('candidateId', '==', candidateId),
          orderBy('createdAt', 'asc')
        )
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        completedAt: doc.data().completedAt?.toDate() || undefined
      })) as CandidateStage[];
    } catch (error) {
      console.error('Error getting candidate stages:', error);
      toast({ title: "Erro ao carregar etapas do candidato", variant: "destructive" });
      return [];
    }
  };

  // Candidate Notes
  const addCandidateNote = async (noteData: Omit<CandidateNote, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'candidateNotes'), {
        ...noteData,
        createdAt: Timestamp.now()
      });
      toast({ title: "Nota adicionada com sucesso!" });
      return docRef.id;
    } catch (error) {
      console.error('Error adding candidate note:', error);
      toast({ title: "Erro ao adicionar nota", variant: "destructive" });
      throw error;
    }
  };

  const getCandidateNotes = async (candidateId: string): Promise<CandidateNote[]> => {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, 'candidateNotes'), 
          where('candidateId', '==', candidateId),
          orderBy('createdAt', 'desc')
        )
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as CandidateNote[];
    } catch (error) {
      console.error('Error getting candidate notes:', error);
      toast({ title: "Erro ao carregar notas do candidato", variant: "destructive" });
      return [];
    }
  };

  // Initialize candidate stages when a new candidate is added
  const initializeCandidateStages = async (candidateId: string) => {
    try {
      const stages = await getStages();
      for (const stage of stages) {
        await addCandidateStage({
          candidateId,
          stageId: stage.id!,
          stageName: stage.name,
          status: stage.order === 1 ? 'current' : 'pending'
        });
      }
    } catch (error) {
      console.error('Error initializing candidate stages:', error);
    }
  };

  // Batch operations
  const addBatch = async (batchData: Omit<Batch, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'batches'), {
        ...batchData,
        createdAt: Timestamp.now()
      });
      toast({ title: "Lote criado com sucesso!" });
      return docRef.id;
    } catch (error) {
      console.error('Error adding batch:', error);
      toast({ title: "Erro ao criar lote", variant: "destructive" });
      throw error;
    }
  };

  const getBatches = async (): Promise<Batch[]> => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'batches'), orderBy('createdAt', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Batch[];
    } catch (error) {
      console.error('Error getting batches:', error);
      toast({ title: "Erro ao carregar lotes", variant: "destructive" });
      return [];
    }
  };

  const updateBatch = async (id: string, updates: Partial<Batch>) => {
    try {
      await updateDoc(doc(db, 'batches', id), {
        ...updates,
        updatedAt: Timestamp.now()
      });
      toast({ title: "Lote atualizado com sucesso!" });
    } catch (error) {
      console.error('Error updating batch:', error);
      toast({ title: "Erro ao atualizar lote", variant: "destructive" });
      throw error;
    }
  };

  const deleteBatch = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'batches', id));
      toast({ title: "Lote removido com sucesso!" });
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast({ title: "Erro ao remover lote", variant: "destructive" });
      throw error;
    }
  };

  // Get dashboard statistics
  const getDashboardStats = async () => {
    try {
      const candidates = await getCandidates();
      const jobs = await getJobs();
      const stages = await getStages();
      
      // Calculate basic stats
      const totalCandidates = candidates.length;
      const approved = candidates.filter(c => c.status === 'approved').length;
      const rejected = candidates.filter(c => c.status === 'rejected').length;
      const pending = candidates.filter(c => c.status === 'pending').length;
      
      // Calculate location stats (mock for now since we don't have location data)
      const regionData = [
        { region: 'São Paulo', candidates: Math.floor(totalCandidates * 0.36), percentage: 36 },
        { region: 'Rio de Janeiro', candidates: Math.floor(totalCandidates * 0.25), percentage: 25 },
        { region: 'Minas Gerais', candidates: Math.floor(totalCandidates * 0.17), percentage: 17 },
        { region: 'Outros', candidates: Math.floor(totalCandidates * 0.22), percentage: 22 }
      ];
      
      // Calculate stage progress based on candidate stages
      const processStages = stages.map(stage => ({
        stage: stage.name,
        candidates: Math.floor(Math.random() * totalCandidates * 0.5) + 10, // Mock for now
        completion: Math.floor(Math.random() * 40) + 60 // Mock completion rate
      }));
      
      return {
        stats: { totalCandidates, approved, rejected, pending },
        regionData,
        processStages,
        totalJobs: jobs.length,
        activeJobs: jobs.filter(j => j.status === 'open').length
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
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
    deleteJob,
    // Stages
    addStage,
    getStages,
    updateStage,
    deleteStage,
    // Candidate Stages
    addCandidateStage,
    updateCandidateStage,
    getCandidateStages,
    initializeCandidateStages,
    // Candidate Notes
    addCandidateNote,
    getCandidateNotes,
    // Batches
    addBatch,
    getBatches,
    updateBatch,
    deleteBatch,
    // Dashboard
    getDashboardStats,
    // Files
    uploadResume
  };
};