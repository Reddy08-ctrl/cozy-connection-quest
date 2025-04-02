
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Image as ImageIcon, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { MemoryTree as MemoryTreeType, MemoryBranch, Memory } from '@/types/memoryTree';
import { getMemoryTree, createMemoryTree, addBranch, addMemory } from '@/services/memoryTreeService';
import { getUserProfile } from '@/services/userService';
import { useAuth } from '@/hooks/use-auth';

interface MemoryTreeProps {
  matchId: string;
  matchUserId: string;
}

const MemoryTree: React.FC<MemoryTreeProps> = ({ matchId, matchUserId }) => {
  const { user } = useAuth();
  const [memoryTree, setMemoryTree] = useState<MemoryTreeType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<MemoryBranch | null>(null);
  const [matchUser, setMatchUser] = useState<{ name: string; avatar?: string } | null>(null);
  const [showAddBranchDialog, setShowAddBranchDialog] = useState(false);
  const [showAddMemoryDialog, setShowAddMemoryDialog] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newMemory, setNewMemory] = useState({
    title: '',
    description: '',
    image: null as File | null
  });
  
  const treeContainer = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const loadMemoryTree = async () => {
      if (!user || !matchUserId) return;
      
      try {
        setLoading(true);
        
        // Get match user profile
        const matchUserProfile = await getUserProfile(matchUserId);
        if (matchUserProfile) {
          setMatchUser({
            name: matchUserProfile.name,
            avatar: matchUserProfile.avatar || undefined
          });
        }
        
        // Get or create memory tree
        let tree = await getMemoryTree(user.id, matchUserId);
        
        if (!tree) {
          tree = await createMemoryTree(user.id, matchUserId);
          if (tree) {
            toast.success('Created a new memory tree for your relationship!');
          }
        }
        
        setMemoryTree(tree);
        
        if (tree && tree.branches.length > 0) {
          setSelectedBranch(tree.branches[0]);
        }
      } catch (err) {
        console.error('Error loading memory tree:', err);
        toast.error('Failed to load your memory tree');
      } finally {
        setLoading(false);
      }
    };
    
    loadMemoryTree();
  }, [user, matchUserId]);
  
  const handleAddBranch = async () => {
    if (!memoryTree || !newBranchName.trim() || !user) return;
    
    try {
      const branch = await addBranch(memoryTree.id, newBranchName.trim());
      
      if (branch) {
        setMemoryTree({
          ...memoryTree,
          branches: [...memoryTree.branches, branch]
        });
        setNewBranchName('');
        setShowAddBranchDialog(false);
        toast.success('Added new branch to your memory tree');
      }
    } catch (err) {
      console.error('Error adding branch:', err);
      toast.error('Failed to add branch to memory tree');
    }
  };
  
  const handleAddMemory = async () => {
    if (!memoryTree || !selectedBranch || !user || !newMemory.title.trim()) return;
    
    try {
      const memory = await addMemory(
        selectedBranch.id,
        memoryTree.id,
        user.id,
        newMemory.title.trim(),
        newMemory.description.trim(),
        newMemory.image
      );
      
      if (memory) {
        // Update the branch with the new memory
        const updatedBranches = memoryTree.branches.map(branch => {
          if (branch.id === selectedBranch.id) {
            return {
              ...branch,
              memories: [...branch.memories, memory]
            };
          }
          return branch;
        });
        
        setMemoryTree({
          ...memoryTree,
          branches: updatedBranches
        });
        
        // Update selected branch
        const updatedSelectedBranch = updatedBranches.find(branch => branch.id === selectedBranch.id);
        if (updatedSelectedBranch) {
          setSelectedBranch(updatedSelectedBranch);
        }
        
        // Reset form
        setNewMemory({
          title: '',
          description: '',
          image: null
        });
        
        setShowAddMemoryDialog(false);
        toast.success('Added new memory to your tree');
      }
    } catch (err) {
      console.error('Error adding memory:', err);
      toast.error('Failed to add memory');
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewMemory({ ...newMemory, image: file });
  };
  
  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!memoryTree) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">No memory tree found</p>
          <Button onClick={() => createMemoryTree(user?.id || '', matchUserId)}>
            Create Memory Tree
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary h-5 w-5" />
          <h2 className="text-lg font-serif">Our Memory Tree</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={user?.avatar || undefined} />
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm">+</span>
          <Avatar className="h-6 w-6">
            <AvatarImage src={matchUser?.avatar} />
            <AvatarFallback>{matchUser?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-white/10 to-white/5 p-4">
        {/* Tree visualization */}
        <div 
          ref={treeContainer} 
          className="relative w-full h-[70vh] overflow-hidden bg-gradient-to-b from-green-50/10 to-blue-50/5 rounded-xl border border-white/10 backdrop-blur-sm"
        >
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600">
            {/* Tree trunk */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              d="M400,500 Q400,400 400,300 Q400,200 400,100"
              stroke="#8B5CF6"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
            />
            
            {/* Tree branches */}
            {memoryTree.branches.map((branch, index) => {
              const side = index % 2 === 0 ? -1 : 1;
              const posY = 150 + (index * 80);
              return (
                <motion.g key={branch.id}>
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 1 + (index * 0.2), ease: "easeInOut" }}
                    d={`M400,${posY} Q${400 + (side * 100)},${posY - 20} ${400 + (side * 200)},${posY - 10}`}
                    stroke="#8B5CF6"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />
                  
                  <motion.circle
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.5 + (index * 0.2), duration: 0.5 }}
                    cx={400 + (side * 200)}
                    cy={posY - 10}
                    r="30"
                    fill={selectedBranch?.id === branch.id ? "#8B5CF6" : "#D1C4E9"}
                    stroke="#8B5CF6"
                    strokeWidth="2"
                    className="cursor-pointer hover:fill-primary transition-colors"
                    onClick={() => setSelectedBranch(branch)}
                  />
                  
                  <motion.text
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.7 + (index * 0.2) }}
                    x={400 + (side * 200)}
                    y={posY - 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs select-none pointer-events-none"
                    fill={selectedBranch?.id === branch.id ? "white" : "black"}
                  >
                    {branch.name.length > 10 ? branch.name.substring(0, 8) + '...' : branch.name}
                  </motion.text>
                </motion.g>
              );
            })}
            
            {/* Add branch button */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="cursor-pointer"
              onClick={() => setShowAddBranchDialog(true)}
            >
              <circle cx="400" cy="550" r="25" fill="#9CA3AF" fillOpacity="0.6" />
              <line x1="385" y1="550" x2="415" y2="550" stroke="white" strokeWidth="3" />
              <line x1="400" y1="535" x2="400" y2="565" stroke="white" strokeWidth="3" />
            </motion.g>
          </svg>
        </div>
        
        {/* Memory display */}
        {selectedBranch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{selectedBranch.name} Memories</h3>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 gap-1"
                onClick={() => setShowAddMemoryDialog(true)}
              >
                <Plus className="h-3 w-3" /> Add Memory
              </Button>
            </div>
            
            <div className="max-h-40 overflow-y-auto">
              {selectedBranch.memories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No memories added yet. Add your first memory!
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedBranch.memories.map(memory => (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-2 bg-white rounded-lg border shadow-sm"
                    >
                      <h4 className="font-medium text-sm">{memory.title}</h4>
                      {memory.description && (
                        <p className="text-xs text-gray-600 mt-1">{memory.description}</p>
                      )}
                      {memory.imageUrl && (
                        <div className="mt-2 rounded-md overflow-hidden">
                          <img 
                            src={memory.imageUrl} 
                            alt={memory.title}
                            className="w-full h-24 object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>
                          <Calendar className="inline h-3 w-3 mr-1" />
                          {new Date(memory.createdAt).toLocaleDateString()}
                        </span>
                        <span>
                          {memory.createdBy === user?.id ? 'You' : matchUser?.name}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Add Branch Dialog */}
      <Dialog open={showAddBranchDialog} onOpenChange={setShowAddBranchDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Branch name (e.g., First Date, Weekend Trip)"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowAddBranchDialog(false)}>Cancel</Button>
            <Button onClick={handleAddBranch} disabled={!newBranchName.trim()}>Add Branch</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Add Memory Dialog */}
      <Dialog open={showAddMemoryDialog} onOpenChange={setShowAddMemoryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Memory to {selectedBranch?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Memory title"
                value={newMemory.title}
                onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Textarea
                placeholder="Describe this memory..."
                value={newMemory.description}
                onChange={(e) => setNewMemory({ ...newMemory, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm mb-1">Add Image (optional)</label>
              <div className="flex items-center gap-2">
                <label className="flex-1">
                  <div className="cursor-pointer border-2 border-dashed rounded-md p-4 text-center hover:bg-muted/50 transition-colors">
                    <ImageIcon className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </label>
                
                {newMemory.image && (
                  <div className="relative h-20 w-20">
                    <img
                      src={URL.createObjectURL(newMemory.image)}
                      alt="Preview"
                      className="h-full w-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-background rounded-full p-0.5"
                      onClick={() => setNewMemory({ ...newMemory, image: null })}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowAddMemoryDialog(false)}>Cancel</Button>
            <Button onClick={handleAddMemory} disabled={!newMemory.title.trim()}>
              Add Memory
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemoryTree;
