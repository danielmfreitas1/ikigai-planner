import React from 'react';
import { usePlanner } from '../../../contexts/PlannerContext';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Notification from '../../../components/common/Notification';

interface ValuesProps {
  plannerId: string;
}

const Values: React.FC<ValuesProps> = ({ plannerId }) => {
  const { currentPlanner, updatePlanner, loading, error } = usePlanner();
  const [values, setValues] = React.useState<string[]>([]);
  const [newValue, setNewValue] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (currentPlanner) {
      setValues(currentPlanner.ikigaiValues.values || []);
    }
  }, [currentPlanner]);

  const handleAddValue = () => {
    if (newValue.trim()) {
      setValues([...values, newValue.trim()]);
      setNewValue('');
    }
  };

  const handleRemoveValue = (index: number) => {
    setValues(values.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      await updatePlanner(plannerId, {
        ikigaiValues: {
          ...currentPlanner?.ikigaiValues,
          values
        }
      });
      setIsEditing(false);
      setSuccessMessage('Valores atualizados com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      // Erro já será tratado pelo contexto
    }
  };

  return (
    <Card title="Valores">
      {error && (
        <Notification
          type="error"
          message="Erro ao salvar"
          description={error}
        />
      )}
      
      {successMessage && (
        <Notification
          type="success"
          message={successMessage}
        />
      )}
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-4">
          Seus valores fundamentais representam os princípios que guiam suas decisões e ações diárias.
        </p>
        
        {isEditing ? (
          <div>
            <div className="flex mb-2">
              <Input
                value={newValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewValue(e.target.value)}
                placeholder="Digite um valor..."
                className="mr-2"
              />
              <Button 
                onClick={handleAddValue}
                disabled={!newValue.trim()}
              >
                Adicionar
              </Button>
            </div>
            
            {values.length > 0 ? (
              <div className="mt-4 space-y-2">
                {values.map((value, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200">
                    <span className="text-gray-800">{value}</span>
                    <button
                      onClick={() => handleRemoveValue(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic mt-4">Nenhum valor adicionado ainda.</p>
            )}
            
            <div className="flex justify-end mt-4 space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setValues(currentPlanner?.ikigaiValues.values || []);
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                isLoading={loading}
              >
                Salvar
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 min-h-[100px]">
              {values.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {values.map((value, index) => (
                    <li key={index} className="text-gray-800">{value}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 italic">Nenhum valor definido ainda.</p>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setIsEditing(true)}>
                {values.length > 0 ? 'Editar' : 'Definir Valores'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Values;
