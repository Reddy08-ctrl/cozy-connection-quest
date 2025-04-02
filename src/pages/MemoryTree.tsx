
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import MemoryTree from '@/components/memoryTree/MemoryTree';
import PageTransition from '@/components/ui/PageTransition';

const MemoryTreePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  return (
    <Layout>
      <PageTransition>
        <div className="min-h-[calc(100vh-4rem)] flex flex-col">
          <div className="p-4 flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/matches')}
              className="rounded-full"
            >
              <ArrowLeft size={18} />
            </Button>
            <h1 className="ml-2 text-xl font-serif">Memory Tree</h1>
          </div>
          
          <div className="flex-1">
            {id && <MemoryTree matchId={id} matchUserId={id} />}
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default MemoryTreePage;
