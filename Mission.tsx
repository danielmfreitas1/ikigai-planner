import React from 'react';
import { usePlanner } from '../../../contexts/PlannerContext';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Notification from '../../../components/common/Notification';

interface MissionProps {
  plannerId: string;
}

const Mission: React.FC<MissionProps> = ({ plannerId }) => {
  const { currentPlanner, updatePlanner, loading, error } = usePlanner();
  const [mission, setMission] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (currentPlanner) {
      setMission(currentPlanner.ikigaiValues.mission || '');
    }
  }, [currentPlanner]);

  const handleSave = async () => {
    try {
      await updatePlanner(plannerId, {
        ikigaiValues: {
          mission,
          vision: currentPlanner?.ikigaiValues?.vision || '',
          values: currentPlanner?.ikigaiValues?.values || [],
          yearFocus: currentPlanner?.ikigaiValues?.yearFocus || ''
        }
      });
      setIsEditing(false);
      setSuccessMessage('Missão atualizada com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      // Erro já será tratado pelo contexto
    }
  };

  return (
    <Card title="Missão">
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
          Sua missão representa seu propósito de vida, o que você deseja realizar e como pretende contribuir para o mundo.
        </p>
        
        {isEditing ? (
          <div>
            <Input
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              placeholder="Digite sua missão..."
              className="w-full"
            />
            <div className="flex justify-end mt-4 space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setMission(currentPlanner?.ikigaiValues.mission || '');
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
              {mission ? (
                <p className="text-gray-800">{mission}</p>
              ) : (
                <p className="text-gray-400 italic">Nenhuma missão definida ainda.</p>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setIsEditing(true)}>
                {mission ? 'Editar' : 'Definir Missão'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Mission;
