import { useEffect, useState } from "react";


function UseEffectRender() {
    const [models, setModels] = useState([]);
    const URL = "http://localhost:8000/models"
    useEffect(() => {
        fetch(URL)
            .then((response) => response.json())
            .then((data) => setModels(data.models || []))
            .catch((error) => console.error(error));
    }, []);  // [] 처음 실행될 때 한번만 실행하도록 함 
    return (
        <main>
            <h1>모델 목록222</h1>
            <ul>
                {models.map((model) => (
                    <li key={model}>{model}</li>
                ))}
            </ul>
        </main>
    );
}
export default UseEffectRender;