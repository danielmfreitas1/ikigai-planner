import React from 'react';
import { usePlanner } from '../../../contexts/PlannerContext';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Notification from '../../../components/common/Notification';

interface YearFocusProps {
  plannerId: string;
}

const YearFocus: React.FC<YearFocusProps> = ({ plannerId }) => {
  const { currentPlanner, updatePlanner, loading, error } = usePlanner();
  const [yearFocus, setYearFocus] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (currentPlanner) {
      setYearFocus(currentPlanner.ikigaiValues.yearFocus || '');
    }
  }, [currentPlanner]);

  const handleSave = async () => {
    try {
      await updatePlanner(plannerId, {
        ikigaiValues: {
          ...currentPlanner?.ikigaiValues,
          yearFocus
        }
      });
      setIsEditing(false);
      setSuccessMessage('Foco do ano atualizado com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      // Erro já será tratado pelo contexto
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <Card title={`Área do Ano (${currentYear})`}>
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
          Defina a área principal de foco para este ano, o que você deseja priorizar e desenvolver nos próximos meses.
        </p>
        
        {isEditing ? (
          <div>
            <Input
              value={yearFocus}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYearFocus(e.target.value)}
              placeholder="Digite o foco do seu ano..."
              className="w-full"
            />
            <div className="flex justify-end mt-4 space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setYearFocus(currentPlanner?.ikigaiValues.yearFocus || '');
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
              {yearFocus ? (
                <p className="text-gray-800">{yearFocus}</p>
              ) : (
                <p className="text-gray-400 italic">Nenhum foco definido para este ano.</p>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setIsEditing(true)}>
                {yearFocus ? 'Editar' : 'Definir Foco do Ano'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default YearFocus;
