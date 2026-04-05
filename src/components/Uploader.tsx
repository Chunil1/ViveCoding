import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Card, Text, Title, Button, TextInput } from '@tremor/react';
import { setUploadedGuideline, setApiKey } from '../store/mappingSlice';

export default function Uploader() {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [localApiKey, setLocalApiKey] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== "text/plain" && !file.name.endsWith('.txt')) {
      alert("현재는 .txt 텍스트 파일만 지원됩니다.");
      return;
    }
    
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // RTK 상태에 업로드된 내용 저장
      dispatch(setUploadedGuideline({ name: file.name, content: text }));
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <Card className="flex flex-col gap-4 h-full">
      <div>
        <Title>내부 지침 업로드</Title>
        <Text>AI Gap 분석을 위해 내부 시스템 규정(.txt)을 올려주세요.</Text>
      </div>

      <div 
        className={`flex-1 border-2 border-dashed rounded-tremor-default p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input 
          ref={inputRef}
          type="file" 
          accept=".txt" 
          onChange={handleChange} 
          className="hidden" 
        />
        {fileName ? (
          <div>
            <Text className="font-medium text-blue-600 mb-2">파일 업로드 완료</Text>
            <Text>{fileName}</Text>
          </div>
        ) : (
          <div>
            <Text className="font-medium text-slate-700">여기로 파일을 드래그 하거나</Text>
            <Text className="text-slate-500 mt-1">클릭하여 선택하세요</Text>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <Text className="text-xs mb-2">Gemini API Key (로컬 시연용)</Text>
        <div className="flex gap-2">
          <TextInput 
            type="password" 
            placeholder="AI Key를 입력해주세요" 
            value={localApiKey}
            onChange={(e) => setLocalApiKey(e.target.value)}
          />
          <Button 
            size="xs" 
            onClick={() => dispatch(setApiKey(localApiKey))}
            disabled={!localApiKey}
          >
            적용
          </Button>
        </div>
      </div>
    </Card>
  );
}
