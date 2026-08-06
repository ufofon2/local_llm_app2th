import axios from "axios";
import { useEffect, useState } from "react";

function UseEffectRender() {
  const [models, setModels] = useState([]);
  const URL = "http://localhost:8000/models";

  useEffect(() => {
    axios
      .get(URL)
      .then((response) => {
        setModels(response.data.models || []);
      })
      .catch((error) => {
        console.error("모델 목록 조회 실패:", error);
      });
  }, []);

  return (
    <main>
      <h1>모델 목록333</h1>

      <ul>
        {models.map((model) => (
          <li key={model}>{model}</li>
        ))}
      </ul>
    </main>
  );
}

export default UseEffectRender;