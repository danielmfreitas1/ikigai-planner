import React from 'react';
import { usePlanner } from '../../../contexts/PlannerContext';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Notification from '../../../components/common/Notification';

interface VisionProps {
  plannerId: string;
}

const Vision: React.FC<VisionProps> = ({ plannerId }) => {
  const { currentPlanner, updatePlanner, loading, error } = usePlanner();
  const [vision, setVision] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (currentPlanner) {
      setVision(currentPlanner.ikigaiValues.vision || '');
    }
  }, [currentPlanner]);

  const handleSave = async () => {
    try {
      await updatePlanner(plannerId, {
        ikigaiValues: {
          ...currentPlanner?.ikigaiValues,
          vision
        }
      });
      setIsEditing(false);
      setSuccessMessage('Visão atualizada com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      // Erro já será tratado pelo contexto
    }
  };

  return (
    <Card title="Visão">
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
          Sua visão representa o futuro que você deseja criar, como você imagina sua vida ideal e o que pretende alcançar a longo prazo.
        </p>
        
        {isEditing ? (
          <div>
            <Input
              value={vision}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVision(e.target.value)}
              placeholder="Digite sua visão..."
              className="w-full"
            />
            <div className="flex justify-end mt-4 space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setVision(currentPlanner?.ikigaiValues.vision || '');
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
              {vision ? (
                <p className="text-gray-800">{vision}</p>
              ) : (
                <p className="text-gray-400 italic">Nenhuma visão definida ainda.</p>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setIsEditing(true)}>
                {vision ? 'Editar' : 'Definir Visão'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Vision;
