import { useState } from 'react';
import ServiceSelector from '../components/ServiceSelector';
import DateSelector from '../components/DateSelector';
import ScanningForm from '../components/ScanningForm';
import DataEntryForm from '../components/DataEntryForm';
import ImageUpload from '../components/ImageUpload';
import Summary from '../components/Summary';
import SaveSuccess from '../components/SaveSuccess';
import EvaluationList from '../components/EvaluationList';
import EvaluationDetail from '../components/EvaluationDetail';
import CostSettingsPage from '../components/CostSettingsPage';
import AppShell from '../components/AppShell';
import { glassPanel, glassButton, buttonColors, hoverLift, hoverReset } from '../styles/glass';

export default function Home() {
  const [selectedService, setSelectedService] = useState('');
  const [evaluationDate, setEvaluationDate] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [scanningData, setScanningData] = useState({});
  const [dataEntryData, setDataEntryData] = useState({});
  const [images, setImages] = useState([]);
  const [savedEvaluationId, setSavedEvaluationId] = useState(null);
  const [currentView, setCurrentView] = useState('main'); // main, list, detail
  const [selectedEvaluationId, setSelectedEvaluationId] = useState(null);

  const handleServiceNext = () => {
    if (selectedService && evaluationDate) {
      setCurrentStep(2);
    } else {
      alert('กรุณาเลือกบริการและวันที่ประเมิน');
    }
  };

  const handleFormNext = () => {
    setCurrentStep(3);
  };

  const handleImageNext = () => {
    setCurrentStep(4);
  };

  const handleSummaryNext = () => {
    setCurrentStep(5);
  };

  const handleBackToService = () => {
    setCurrentStep(1);
  };

  const handleBackToForm = () => {
    setCurrentStep(2);
  };

  const handleBackToImage = () => {
    setCurrentStep(3);
  };

  const handleBackToSummary = () => {
    setCurrentStep(4);
  };

  const handleSaveSuccess = (evaluationId) => {
    setSavedEvaluationId(evaluationId);
    setCurrentStep(5);
  };

  const handleNewEvaluation = () => {
    setSelectedService('');
    setEvaluationDate('');
    setScanningData({});
    setDataEntryData({});
    setImages([]);
    setSavedEvaluationId(null);
    setCurrentStep(1);
    setCurrentView('main');
  };

  const handleViewAll = () => {
    setCurrentView('list');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
  };

  const handleViewDetail = (evaluationId) => {
    setSelectedEvaluationId(evaluationId);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedEvaluationId(null);
  };

  const handleNavigate = (key) => {
    if (key === 'list') setSelectedEvaluationId(null);
    setCurrentView(key);
  };

  // แสดงหน้าตั้งค่าอัตราต้นทุน
  if (currentView === 'settings') {
    return (
      <AppShell active="settings" title="ตั้งค่าต้นทุน" subtitle="อัตราต้นทุนมาตรฐานที่ใช้คำนวณ Breakdown Cost" onNavigate={handleNavigate}>
        <div style={glassPanel}>
          <CostSettingsPage onBack={handleBackToMain} />
        </div>
      </AppShell>
    );
  }

  // แสดงหน้าแสดงข้อมูลทั้งหมด
  if (currentView === 'list') {
    return (
      <AppShell active="list" title="ข้อมูลการประเมิน" subtitle="รายการประเมินทั้งหมดที่บันทึกไว้" onNavigate={handleNavigate}>
        <div style={glassPanel}>
          <EvaluationList onBack={handleBackToMain} onViewDetail={handleViewDetail} />
        </div>
      </AppShell>
    );
  }

  // แสดงหน้ารายละเอียดการประเมิน
  if (currentView === 'detail') {
    return (
      <AppShell active="list" title="รายละเอียดการประเมิน" subtitle={`รหัสการประเมิน #${selectedEvaluationId}`} onNavigate={handleNavigate}>
        <div className="print-report-page">
          <div className="print-report-panel" style={glassPanel}>
            <EvaluationDetail evaluationId={selectedEvaluationId} onBack={handleBackToList} />
          </div>
        </div>
      </AppShell>
    );
  }

  // หน้าหลัก - ระบบบันทึกข้อมูล
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <ServiceSelector 
              selectedService={selectedService}
              onServiceChange={setSelectedService}
            />
            <DateSelector 
              selectedDate={evaluationDate}
              onDateChange={setEvaluationDate}
            />
            <button
              onClick={handleServiceNext}
              style={{ ...glassButton(...buttonColors.primary), width: '100%', marginTop: '8px', padding: '13px 18px', fontSize: '15px' }}
              onMouseOver={hoverLift}
              onMouseOut={hoverReset}
            >
              เริ่มประเมิน
            </button>
          </div>
        );

      case 2:
        if (selectedService === 'scanning') {
          return (
            <ScanningForm
              formData={scanningData}
              onFormChange={setScanningData}
              onNext={handleFormNext}
              onBack={handleBackToService}
            />
          );
        } else if (selectedService === 'data_entry') {
          return (
            <DataEntryForm
              formData={dataEntryData}
              onFormChange={setDataEntryData}
              onNext={handleFormNext}
              onBack={handleBackToService}
            />
          );
        }
        break;

      case 3:
        return (
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            onNext={handleImageNext}
            onBack={handleBackToForm}
          />
        );

      case 4:
        return (
          <Summary
            selectedService={selectedService}
            evaluationDate={evaluationDate}
            scanningData={scanningData}
            dataEntryData={dataEntryData}
            images={images}
            onBack={handleBackToImage}
            onSave={handleSaveSuccess}
          />
        );

      case 5:
        return (
          <SaveSuccess
            evaluationId={savedEvaluationId}
            onNewEvaluation={handleNewEvaluation}
            onViewAll={handleViewAll}
          />
        );

      default:
        return null;
    }
  };

  const steps = ['เลือกบริการ', 'กรอกข้อมูล', 'แนบรูปภาพ', 'สรุปผล'];

  return (
    <AppShell
      active="main"
      title="ระบบบันทึกข้อมูลการประเมินหน้างาน"
      subtitle="ประเมินหน้างานสแกนเอกสารและบันทึกข้อมูล เพื่อใช้คำนวณราคา"
      onNavigate={handleNavigate}
    >
      {currentStep < 5 && (
        <ol className="app-steps" aria-label="ขั้นตอน" style={{ listStyle: 'none', padding: 0 }}>
          {steps.map((label, i) => {
            const n = i + 1;
            const state = n === currentStep ? ' is-current' : n < currentStep ? ' is-done' : '';
            return (
              <li key={label} className={`app-step${state}`} aria-current={n === currentStep ? 'step' : undefined}>
                <span className="app-step-num">{n < currentStep ? '✓' : n}</span>
                {label}
              </li>
            );
          })}
        </ol>
      )}

      <div style={{ ...glassPanel, maxWidth: '860px' }}>
        {renderCurrentStep()}
      </div>
    </AppShell>
  );
}
