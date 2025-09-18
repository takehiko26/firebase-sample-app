import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { db, storage, functions } from './lib/firebase';
import './App.css';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: any;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Firestore からリアルタイムでデータを取得
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'todos'),
      (snapshot) => {
        const todosData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Todo));
        setTodos(todosData);
      }
    );

    return () => unsubscribe();
  }, []);

  // Todo を追加
  const addTodo = async () => {
    if (newTodo.trim()) {
      await addDoc(collection(db, 'todos'), {
        text: newTodo,
        completed: false,
        createdAt: new Date()
      });
      setNewTodo('');
    }
  };

  // Todo を削除
  const deleteTodo = async (id: string) => {
    await deleteDoc(doc(db, 'todos', id));
  };

  // ファイルアップロード
  const uploadFile = async () => {
    if (selectedFile) {
      const storageRef = ref(storage, `images/${selectedFile.name}`);
      const snapshot = await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setUploadedImages(prev => [...prev, downloadURL]);
      setSelectedFile(null);
    }
  };

  // Cloud Function を呼び出し
  const callFunction = async () => {
    const helloWorld = httpsCallable(functions, 'helloWorld');
    const result = await helloWorld();
    console.log(result.data);
  };

  return (
    <div className="App">
      <h1>Firebase Sample App</h1>
      
      {/* Todo 機能 */}
      <div>
        <h2>Todo List (Firestore)</h2>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="新しいTodoを入力"
        />
        <button onClick={addTodo}>追加</button>
        
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>
              {todo.text}
              <button onClick={() => deleteTodo(todo.id)}>削除</button>
            </li>
          ))}
        </ul>
      </div>

      {/* ファイルアップロード機能 */}
      <div>
        <h2>File Upload (Storage)</h2>
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        />
        <button onClick={uploadFile} disabled={!selectedFile}>
          アップロード
        </button>
        
        <div>
          {uploadedImages.map((url, index) => (
            <img key={index} src={url} alt={`upload-${index}`} width="200" />
          ))}
        </div>
      </div>

      {/* Cloud Function 呼び出し */}
      <div>
        <h2>Cloud Functions</h2>
        <button onClick={callFunction}>Function を呼び出し</button>
      </div>
    </div>
  );
}

export default App;