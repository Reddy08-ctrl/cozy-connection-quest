
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface QuestionCardProps {
  question: {
    id: number;
    text: string;
    type: 'multiple_choice' | 'text';
    options?: string[];
  };
  onAnswer: (id: number, answer: string) => void;
}

const QuestionCard = ({ question, onAnswer }: QuestionCardProps) => {
  const [textAnswer, setTextAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextAnswer(e.target.value);
    onAnswer(question.id, e.target.value);
  };

  const handleOptionSelect = (value: string) => {
    setSelectedOption(value);
    onAnswer(question.id, value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-xl mx-auto"
    >
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-xl font-serif font-medium">{question.text}</h3>
          
          <AnimatePresence mode="wait">
            {question.type === 'multiple_choice' && question.options && (
              <motion.div 
                key="options"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pt-2"
              >
                <RadioGroup value={selectedOption} onValueChange={handleOptionSelect}>
                  <div className="space-y-3">
                    {question.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value={option} 
                          id={`option-${question.id}-${index}`} 
                          className="text-primary border-primary/30"
                        />
                        <Label 
                          htmlFor={`option-${question.id}-${index}`}
                          className="cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </motion.div>
            )}

            {question.type === 'text' && (
              <motion.div
                key="text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pt-2"
              >
                <Textarea
                  value={textAnswer}
                  onChange={handleTextChange}
                  placeholder="Type your answer here..."
                  className="min-h-[120px] resize-none bg-white/50 backdrop-blur-sm border-white/30 focus:border-primary"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuestionCard;
