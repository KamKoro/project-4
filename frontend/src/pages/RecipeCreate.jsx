import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { recipesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Upload } from 'lucide-react';
import IngredientSelector from '../components/IngredientSelector';
import UnitsSelector from '../components/UnitsSelector';

// Import UNITS for finding selected unit
const UNITS = [
  // Volume units
  { value: 'tsp', label: 'tsp (teaspoon)', category: 'Volume' },
  { value: 'tbsp', label: 'tbsp (tablespoon)', category: 'Volume' },
  { value: 'cup', label: 'cup', category: 'Volume' },
  { value: 'ml', label: 'ml (milliliter)', category: 'Volume' },
  { value: 'l', label: 'l (liter)', category: 'Volume' },
  { value: 'fl oz', label: 'fl oz (fluid ounce)', category: 'Volume' },
  { value: 'pt', label: 'pt (pint)', category: 'Volume' },
  { value: 'qt', label: 'qt (quart)', category: 'Volume' },
  { value: 'gal', label: 'gal (gallon)', category: 'Volume' },
  
  // Weight units
  { value: 'g', label: 'g (gram)', category: 'Weight' },
  { value: 'kg', label: 'kg (kilogram)', category: 'Weight' },
  { value: 'oz', label: 'oz (ounce)', category: 'Weight' },
  { value: 'lb', label: 'lb (pound)', category: 'Weight' },
  
  // Count units
  { value: 'piece', label: 'piece', category: 'Count' },
  { value: 'clove', label: 'clove', category: 'Count' },
  { value: 'slice', label: 'slice', category: 'Count' },
  { value: 'whole', label: 'whole', category: 'Count' },
  { value: 'pinch', label: 'pinch', category: 'Count' },
  { value: 'dash', label: 'dash', category: 'Count' },
  
  // Length units
  { value: 'inch', label: 'inch', category: 'Length' },
  { value: 'cm', label: 'cm (centimeter)', category: 'Length' },
  
  // Other
  { value: 'can', label: 'can', category: 'Other' },
  { value: 'package', label: 'package', category: 'Other' },
  { value: 'bunch', label: 'bunch', category: 'Other' },
  { value: 'head', label: 'head', category: 'Other' },
  { value: 'to taste', label: 'to taste', category: 'Other' },
];

const RecipeCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState(null);

  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      prep_time: '',
      cook_time: '',
      servings: '',
      difficulty: 'easy',
      food_type: 'main_course',
      cuisine: '',
      is_public: true,
      ingredients: [{ ingredient_id: null, amount: '', unit: '', notes: '' }],
      instructions: [{ step: '' }]
    }
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: 'ingredients'
  });

  const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = useFieldArray({
    control,
    name: 'instructions'
  });

  const watchedIngredients = useWatch({
    control,
    name: 'ingredients'
  });

  const createMutation = useMutation(
    (recipeData) => recipesAPI.createRecipe(recipeData),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('recipes');
        toast.success('Recipe created successfully!');
        navigate(`/recipes/${response.data.id}`);
      },
      onError: () => {
        toast.error('Failed to create recipe');
      }
    }
  );

  const onSubmit = (data) => {
    // Filter out empty ingredients and instructions
    const filteredData = {
      ...data,
      ingredients: data.ingredients.filter(ing => ing.ingredient_id !== null),
      instructions: data.instructions.filter(inst => inst.step.trim() !== ''),
      prep_time: data.prep_time ? parseInt(data.prep_time) : null,
      cook_time: data.cook_time ? parseInt(data.cook_time) : null,
      servings: data.servings ? parseInt(data.servings) : null,
    };
    
    createMutation.mutate(filteredData);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Recipe</h1>
        <p className="text-gray-600 mt-2">Share your culinary masterpiece with the community</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipe Title *
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                className="input-field"
                placeholder="Enter recipe title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select {...register('difficulty')} className="input-field">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Food Type
              </label>
              <select {...register('food_type')} className="input-field">
                <option value="appetizer">Appetizer</option>
                <option value="main_course">Main Course</option>
                <option value="dessert">Dessert</option>
                <option value="side_dish">Side Dish</option>
                <option value="soup">Soup</option>
                <option value="salad">Salad</option>
                <option value="beverage">Beverage</option>
                <option value="snack">Snack</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cuisine
              </label>
              <select {...register('cuisine')} className="input-field">
                <option value="">Select Cuisine (Optional)</option>
                <option value="american">American</option>
                <option value="italian">Italian</option>
                <option value="mexican">Mexican</option>
                <option value="chinese">Chinese</option>
                <option value="japanese">Japanese</option>
                <option value="thai">Thai</option>
                <option value="indian">Indian</option>
                <option value="french">French</option>
                <option value="greek">Greek</option>
                <option value="spanish">Spanish</option>
                <option value="middle_eastern">Middle Eastern</option>
                <option value="korean">Korean</option>
                <option value="vietnamese">Vietnamese</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="caribbean">Caribbean</option>
                <option value="african">African</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prep Time (minutes)
              </label>
              <input
                {...register('prep_time', { min: 0 })}
                type="number"
                className="input-field"
                placeholder="30"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cook Time (minutes)
              </label>
              <input
                {...register('cook_time', { min: 0 })}
                type="number"
                className="input-field"
                placeholder="45"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Servings
              </label>
              <input
                {...register('servings', { min: 1 })}
                type="number"
                className="input-field"
                placeholder="4"
              />
            </div>
            
            <div className="flex items-center">
              <input
                {...register('is_public')}
                type="checkbox"
                id="is_public"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="is_public" className="ml-2 text-sm text-gray-700">
                Make this recipe public
              </label>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="input-field"
              placeholder="Describe your recipe..."
            />
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipe Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="image" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                    <span>Upload a file</span>
                    <input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
            {imagePreview && (
              <div className="mt-4">
                <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded-lg" />
              </div>
            )}
          </div>
        </div>

        {/* Ingredients */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Ingredients</h2>
            <button
              type="button"
              onClick={() => appendIngredient({ ingredient_id: null, amount: '', unit: '', notes: '' })}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Ingredient</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {ingredientFields.map((field, index) => (
              <div key={field.id} className="space-y-2">
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <IngredientSelector
                      onSelect={(ingredient) => {
                        // Update the form value using setValue
                        setValue(`ingredients.${index}.ingredient_id`, ingredient.id);
                        setValue(`ingredients.${index}.ingredient`, ingredient);
                      }}
                      selectedIngredient={watchedIngredients?.[index]?.ingredient}
                      onClear={() => {
                        setValue(`ingredients.${index}.ingredient_id`, null);
                        setValue(`ingredients.${index}.ingredient`, null);
                      }}
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      {...register(`ingredients.${index}.amount`)}
                      placeholder="Amount"
                      className="input-field"
                    />
                  </div>
                  <div className="col-span-3">
                    <UnitsSelector
                      onSelect={(unit) => {
                        setValue(`ingredients.${index}.unit`, unit.value);
                      }}
                      selectedUnit={watchedIngredients?.[index]?.unit ? 
                        UNITS.find(u => u.value === watchedIngredients[index].unit) : null
                      }
                      onClear={() => {
                        setValue(`ingredients.${index}.unit`, '');
                      }}
                      placeholder="Unit"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <input
                    {...register(`ingredients.${index}.notes`)}
                    placeholder="Additional notes (optional)"
                    className="input-field"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Instructions</h2>
            <button
              type="button"
              onClick={() => appendInstruction({ step: '' })}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Step</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {instructionFields.map((field, index) => (
              <div key={field.id} className="flex space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <textarea
                    {...register(`instructions.${index}.step`)}
                    rows={2}
                    placeholder="Describe this step..."
                    className="input-field"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/recipes')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Recipe...' : 'Create Recipe'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeCreate;
