
import { supabase } from '@/integrations/supabase/client';
import { Memory, MemoryTree, MemoryBranch } from '@/types/memoryTree';
import { toast } from 'sonner';

// Get memory tree for a specific match
export const getMemoryTree = async (userId: string, matchId: string): Promise<MemoryTree | null> => {
  try {
    // First check if a memory tree exists for this match
    const { data: memoryTreeData, error: memoryTreeError } = await supabase
      .from('memory_trees')
      .select('*')
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
      .order('created_at', { ascending: false })
      .single();
    
    if (memoryTreeError) {
      console.error('Error fetching memory tree:', memoryTreeError);
      return null;
    }
    
    if (!memoryTreeData) {
      return null;
    }
    
    // Get branches for this tree
    const { data: branchesData, error: branchesError } = await supabase
      .from('memory_branches')
      .select('*')
      .eq('memory_tree_id', memoryTreeData.id)
      .order('created_at', { ascending: true });
    
    if (branchesError) {
      console.error('Error fetching memory branches:', branchesError);
      return null;
    }
    
    // Get memories for each branch
    const branches: MemoryBranch[] = [];
    
    for (const branch of branchesData || []) {
      const { data: memoriesData, error: memoriesError } = await supabase
        .from('memories')
        .select('*')
        .eq('memory_branch_id', branch.id)
        .order('created_at', { ascending: true });
      
      if (memoriesError) {
        console.error(`Error fetching memories for branch ${branch.id}:`, memoriesError);
        continue;
      }
      
      branches.push({
        id: branch.id,
        memoryTreeId: branch.memory_tree_id,
        name: branch.name,
        createdAt: branch.created_at,
        memories: (memoriesData || []).map(memory => ({
          id: memory.id,
          memoryTreeId: memory.memory_tree_id,
          title: memory.title,
          description: memory.description,
          imageUrl: memory.image_url,
          createdAt: memory.created_at,
          createdBy: memory.created_by
        }))
      });
    }
    
    return {
      id: memoryTreeData.id,
      userId1: memoryTreeData.user_id_1,
      userId2: memoryTreeData.user_id_2,
      createdAt: memoryTreeData.created_at,
      branches
    };
  } catch (error) {
    console.error('Error getting memory tree:', error);
    return null;
  }
};

// Create a new memory tree
export const createMemoryTree = async (userId1: string, userId2: string): Promise<MemoryTree | null> => {
  try {
    // Check if a tree already exists for these users
    const { data: existingTree, error: checkError } = await supabase
      .from('memory_trees')
      .select('id')
      .or(`and(user_id_1.eq.${userId1},user_id_2.eq.${userId2}),and(user_id_1.eq.${userId2},user_id_2.eq.${userId1})`)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing memory tree:', checkError);
      return null;
    }
    
    if (existingTree) {
      toast.info('Memory tree already exists for this relationship');
      return getMemoryTree(userId1, userId2);
    }
    
    // Create new memory tree
    const { data: treeData, error: treeError } = await supabase
      .from('memory_trees')
      .insert({
        user_id_1: userId1,
        user_id_2: userId2
      })
      .select()
      .single();
    
    if (treeError) {
      console.error('Error creating memory tree:', treeError);
      return null;
    }
    
    // Create a default branch
    const { data: branchData, error: branchError } = await supabase
      .from('memory_branches')
      .insert({
        memory_tree_id: treeData.id,
        name: 'First Meeting'
      })
      .select()
      .single();
    
    if (branchError) {
      console.error('Error creating default branch:', branchError);
    }
    
    return {
      id: treeData.id,
      userId1: treeData.user_id_1,
      userId2: treeData.user_id_2,
      createdAt: treeData.created_at,
      branches: branchData ? [
        {
          id: branchData.id,
          memoryTreeId: branchData.memory_tree_id,
          name: branchData.name,
          createdAt: branchData.created_at,
          memories: []
        }
      ] : []
    };
  } catch (error) {
    console.error('Error creating memory tree:', error);
    return null;
  }
};

// Add a branch to a memory tree
export const addBranch = async (
  memoryTreeId: string,
  branchName: string
): Promise<MemoryBranch | null> => {
  try {
    const { data, error } = await supabase
      .from('memory_branches')
      .insert({
        memory_tree_id: memoryTreeId,
        name: branchName
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding branch:', error);
      return null;
    }
    
    return {
      id: data.id,
      memoryTreeId: data.memory_tree_id,
      name: data.name,
      createdAt: data.created_at,
      memories: []
    };
  } catch (error) {
    console.error('Error adding branch:', error);
    return null;
  }
};

// Add a memory to a branch
export const addMemory = async (
  branchId: string,
  memoryTreeId: string,
  userId: string,
  title: string,
  description: string,
  imageFile?: File
): Promise<Memory | null> => {
  try {
    let imageUrl;
    
    // Upload image if provided
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `${memoryTreeId}/${branchId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('memory_images')
        .upload(filePath, imageFile);
      
      if (error) {
        console.error('Error uploading image:', error);
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('memory_images')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;
      }
    }
    
    // Save memory record
    const { data, error } = await supabase
      .from('memories')
      .insert({
        memory_branch_id: branchId,
        memory_tree_id: memoryTreeId,
        title,
        description,
        image_url: imageUrl,
        created_by: userId
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding memory:', error);
      return null;
    }
    
    return {
      id: data.id,
      memoryTreeId: data.memory_tree_id,
      title: data.title,
      description: data.description,
      imageUrl: data.image_url,
      createdAt: data.created_at,
      createdBy: data.created_by
    };
  } catch (error) {
    console.error('Error adding memory:', error);
    return null;
  }
};
