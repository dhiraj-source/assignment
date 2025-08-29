import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAtom } from 'jotai';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { categoriesAtom } from '@/lib/store';
import { categorySchema, CategoryForm } from '@/lib/validations';
import { useToast } from '@/hooks/use-toast';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoryModal({ isOpen, onClose }: CategoryModalProps) {
  const [categories, setCategories] = useAtom(categoriesAtom);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
  });

  const onSubmit = async (data: CategoryForm) => {
    setIsLoading(true);
    try {
      const newCategory = {
        id: `category_${Date.now()}`,
        ...data,
      };

      setCategories([...categories, newCategory]);
      
      toast({
        title: "Success",
        description: "Category added successfully!",
      });

      reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className='font-normal'>Category Name *</Label>
            <Input
              id="name"
              placeholder="Enter category name"
              {...register('name')}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter category description"
              {...register('description')}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div> */}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" className='bg-gray-200 hover:bg-gray-300 text-blue-500 px-10'  onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className='px-10'>
              {isLoading ? 'Adding...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}