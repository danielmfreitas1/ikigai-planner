import React, { useState, useEffect } from 'react';
import Icons from '../icons/Icons';
import IconButton from '../common/IconButton';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

interface TaskFormProps {
  onSubmit: (taskData: any) => void;
  onCancel: () => void;
  initialData?: any;
  isEdit?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  isEdit = false
}) => {
  // Estados para os campos do formulário
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [dueDate, setDueDate] = useState(initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '');
  const [lifeRole, setLifeRole] = useState(initialData.lifeRole || '');
  const [energyCategory, setEnergyCategory] = useState(initialData.energyCategory || '');
  const [entropyCategory, setEntropyCategory] = useState(initialData.entropyCategory || '');
  const [importance, setImportance] = useState(initialData.importance || false);
  const [urgency, setUrgency] = useState(initialData.urgency || false);
  const [isQuickAdd, setIsQuickAdd] = useState(false);
  const [quickAddText, setQuickAddText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Opções para os selects
  const lifeRoleOptions = [
    { value: 'profissional', label: 'Profissional' },
    { value: 'familiar', label: 'Familiar' },
    { value: 'pessoal', label: 'Pessoal' },
    { value: 'social', label: 'Social' },
    { value: 'saude', label: 'Saúde' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'espiritual', label: 'Espiritual' },
    { value: 'intelectual', label: 'Intelectual' }
  ];

  const energyCategoryOptions = [
    { value: 'emocional', label: 'EMOCIONAL' },
    { value: 'espiritual', label: 'ESPIRITUAL' },
    { value: 'mental', label: 'MENTAL' },
    { value: 'fisica', label: 'FÍSICA' }
  ];

  const entropyCategoryOptions = [
    { value: 'acao', label: 'Ação' },
    { value: 'planejamento', label: 'Planejamento' },
    { value: 'organizacao', label: 'Organização' },
    { value: 'reflexao', label: 'Reflexão' }
  ];

  // Validar o formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'O título é obrigatório';
    }

    if (isQuickAdd && !quickAddText.trim()) {
      newErrors.quickAddText = 'Digite o texto da tarefa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Processar texto de adição rápida
  const processQuickAddText = (text: string) => {
    // Formato esperado: Título da tarefa @papel #energia $entropia !data
    const taskData: any = {
      title: text,
      importance: false,
      urgency: false
    };

    // Extrair papel de vida (@)
    const roleMatch = text.match(/@(\w+)/);
    if (roleMatch) {
      taskData.lifeRole = roleMatch[1];
      taskData.title = taskData.title.replace(roleMatch[0], '').trim();
    }

    // Extrair categoria de energia (#)
    const energyMatch = text.match(/#(\w+)/);
    if (energyMatch) {
      taskData.energyCategory = energyMatch[1];
      taskData.title = taskData.title.replace(energyMatch[0], '').trim();
    }

    // Extrair categoria de entropia ($)
    const entropyMatch = text.match(/\$(\w+)/);
    if (entropyMatch) {
      taskData.entropyCategory = entropyMatch[1];
      taskData.title = taskData.title.replace(entropyMatch[0], '').trim();
    }

    // Extrair data de vencimento (!)
    const dateMatch = text.match(/!(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}\/\d{2})/);
    if (dateMatch) {
      let dateStr = dateMatch[1];
      
      // Converter formato DD/MM para DD/MM/AAAA
      if (dateStr.match(/^\d{2}\/\d{2}$/)) {
        const currentYear = new Date().getFullYear();
        dateStr = `${dateStr}/${currentYear}`;
      }
      
      // Converter DD/MM/AAAA para AAAA-MM-DD
      if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = dateStr.split('/');
        dateStr = `${year}-${month}-${day}`;
      }
      
      taskData.dueDate = dateStr;
      taskData.title = taskData.title.replace(dateMatch[0], '').trim();
    }

    // Extrair importância e urgência (*)
    if (text.includes('*importante')) {
      taskData.importance = true;
      taskData.title = taskData.title.replace('*importante', '').trim();
    }
    
    if (text.includes('*urgente')) {
      taskData.urgency = true;
      taskData.title = taskData.title.replace('*urgente', '').trim();
    }

    return taskData;
  };

  // Alternar entre modo normal e adição rápida
  const toggleQuickAdd = () => {
    setIsQuickAdd(!isQuickAdd);
    if (!isQuickAdd) {
      // Ao ativar o modo rápido, preencher o campo com os dados atuais
      let text = title;
      
      if (lifeRole) text += ` @${lifeRole}`;
      if (energyCategory) text += ` #${energyCategory}`;
      if (entropyCategory) text += ` $${entropyCategory}`;
      if (dueDate) text += ` !${dueDate}`;
      if (importance) text += ' *importante';
      if (urgency) text += ' *urgente';
      
      setQuickAddText(text);
    } else {
      // Ao desativar o modo rápido, processar o texto e atualizar os campos
      const processedData = processQuickAddText(quickAddText);
      setTitle(processedData.title || '');
      setLifeRole(processedData.lifeRole || '');
      setEnergyCategory(processedData.energyCategory || '');
      setEntropyCategory(processedData.entropyCategory || '');
      setDueDate(processedData.dueDate || '');
      setImportance(processedData.importance || false);
      setUrgency(processedData.urgency || false);
    }
  };

  // Manipular envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isQuickAdd) {
      // Processar texto de adição rápida
      const processedData = processQuickAddText(quickAddText);
      
      // Validar dados processados
      if (!processedData.title) {
        setErrors({ quickAddText: 'O título da tarefa é obrigatório' });
        return;
      }
      
      onSubmit({
        ...processedData,
        description: description || ''
      });
    } else {
      // Validar formulário normal
      if (validateForm()) {
        onSubmit({
          title,
          description,
          dueDate: dueDate || null,
          lifeRole,
          energyCategory,
          entropyCategory,
          importance,
          urgency
        });
      }
    }
  };

  // Sugestões para adição rápida
  const quickAddSuggestions = [
    { text: '@profissional', description: 'Papel de vida' },
    { text: '#mental', description: 'Categoria de energia' },
    { text: '$acao', description: 'Categoria de entropia' },
    { text: '!2025-05-30', description: 'Data de vencimento' },
    { text: '*importante', description: 'Marcar como importante' },
    { text: '*urgente', description: 'Marcar como urgente' }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {isEdit ? 'Editar Tarefa' : 'Nova Tarefa'}
        </h2>
        <div className="flex items-center">
          <button
            type="button"
            onClick={toggleQuickAdd}
            className={`flex items-center px-3 py-1 rounded-md text-sm mr-2 ${
              isQuickAdd 
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Icons.CommandIcon size={16} className="mr-1" />
            Adição Rápida
          </button>
          <IconButton
            icon="TrashIcon"
            onClick={onCancel}
            variant="outline"
            title="Cancelar"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {isQuickAdd ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texto da Tarefa
            </label>
            <div className="relative">
              <Input
                value={quickAddText}
                onChange={(e) => setQuickAddText(e.target.value)}
                placeholder="Título da tarefa @papel #energia $entropia !data *importante *urgente"
                error={errors.quickAddText}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {quickAddSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="inline-flex items-center px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded hover:bg-gray-200"
                  onClick={() => setQuickAddText(quickAddText + ' ' + suggestion.text)}
                >
                  {suggestion.text}
                  <span className="ml-1 text-gray-500">{suggestion.description}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título da tarefa"
                error={errors.title}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Digite uma descrição (opcional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Papel de Vida
                </label>
                <select
                  value={lifeRole}
                  onChange={(e) => setLifeRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Selecione um papel</option>
                  {lifeRoleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria de Energia
                </label>
                <select
                  value={energyCategory}
                  onChange={(e) => setEnergyCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Selecione uma categoria</option>
                  {energyCategoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria de Entropia
                </label>
                <select
                  value={entropyCategory}
                  onChange={(e) => setEntropyCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Selecione uma categoria</option>
                  {entropyCategoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-6 mb-6">
              <div className="flex items-center">
                <input
                  id="importance"
                  type="checkbox"
                  checked={importance}
                  onChange={(e) => setImportance(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="importance" className="ml-2 block text-sm text-gray-700">
                  Importante
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="urgency"
                  type="checkbox"
                  checked={urgency}
                  onChange={(e) => setUrgency(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="urgency" className="ml-2 block text-sm text-gray-700">
                  Urgente
                </label>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {isEdit ? 'Salvar Alterações' : 'Adicionar Tarefa'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TaskForm;
