import { useEffect, useState } from 'react'
import { getModels } from '../api/chatApi'
import { promptModes } from '../api/promptModes'
import './SettingsPanel.css'

/**
 * 모델, 프롬프트, 파라미터를 설정하는 사이드바 패널입니다.
 * @param {{ settings: object, onChange: (partialSettings: object) => void }} props
 */
export default function SettingsPanel({ settings, onChange }) {
  const [modelList, setModelList] = useState([])

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const models = await getModels()
        setModelList(models)
      } catch (error) {
        console.error('Failed to fetch models:', error)
        // API 호출 실패 시, 현재 설정된 모델을 fallback으로 사용합니다.
        if (settings.model) {
          setModelList([settings.model])
        }
      }
    }
    fetchModels()
  }, [settings.model])

  const handleFieldChange = (field, value) => {
    // 부동소수점 오차 보정
    const processedValue = typeof value === 'number' ? Math.round(value * 100) / 100 : value
    onChange({ [field]: processedValue })
  }

  const handlePromptModeChange = (e) => {
    const modeKey = e.target.value
    if (modeKey === 'custom') {
      onChange({ promptMode: 'custom' })
      return
    }
    const selectedMode = promptModes[modeKey]
    if (selectedMode) {
      onChange({
        promptMode: modeKey,
        systemPrompt: selectedMode.prompt,
      })
    }
  }

  // 현재 시스템 프롬프트와 일치하는 모드를 찾습니다. 없으면 'custom'으로 간주합니다.
  const currentModeKey =
    Object.entries(promptModes).find(([, m]) => m.prompt === settings.systemPrompt)?.[0] ||
    'custom'

  return (
    <aside className="settings-panel">
      <h2 className="settings-panel-title">모델 설정</h2>

      <div className="settings-field">
        <label htmlFor="model-select">모델</label>
        <select id="model-select" value={settings.model} onChange={(e) => handleFieldChange('model', e.target.value)}>
          {modelList.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      <div className="settings-field">
        <label htmlFor="prompt-mode-select">프롬프트 모드</label>
        <select id="prompt-mode-select" value={currentModeKey} onChange={handlePromptModeChange}>
          {Object.entries(promptModes).map(([key, mode]) => (
            <option key={key} value={key}>
              {mode.label}
            </option>
          ))}
          <option value="custom">사용자 지정</option>
        </select>
      </div>

      <div className="settings-field">
        <label htmlFor="system-prompt">시스템 프롬프트</label>
        <textarea
          id="system-prompt"
          rows={5}
          value={settings.systemPrompt}
          onChange={(e) => handleFieldChange('systemPrompt', e.target.value)}
        />
      </div>

      <div className="settings-field">
        <label htmlFor="temperature">Temperature: {settings.temperature}</label>
        <input type="range" id="temperature" min="0" max="2" step="0.1" value={settings.temperature} onChange={(e) => handleFieldChange('temperature', parseFloat(e.target.value))} />
      </div>

      <div className="settings-field">
        <label htmlFor="top-p">Top P: {settings.topP}</label>
        <input type="range" id="top-p" min="0" max="1" step="0.1" value={settings.topP} onChange={(e) => handleFieldChange('topP', parseFloat(e.target.value))} />
      </div>

      <div className="settings-field">
        <label htmlFor="num-predict">Num Predict</label>
        <input type="number" id="num-predict" min="1" max="2048" value={settings.numPredict} onChange={(e) => handleFieldChange('numPredict', parseInt(e.target.value, 10))} />
      </div>
    </aside>
  )
}