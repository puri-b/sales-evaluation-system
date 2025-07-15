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

  // แสดงหน้าแสดงข้อมูลทั้งหมด
  if (currentView === 'list') {
    return (
      <div style={{ 
        padding: '20px', 
        maxWidth: '1200px', 
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <EvaluationList 
            onBack={handleBackToMain}
            onViewDetail={handleViewDetail}
          />
        </div>
      </div>
    );
  }

  // แสดงหน้ารายละเอียดการประเมิน
  if (currentView === 'detail') {
    return (
      <div style={{ 
        padding: '20px', 
        maxWidth: '1200px', 
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <EvaluationDetail 
            evaluationId={selectedEvaluationId}
            onBack={handleBackToList}
          />
        </div>
      </div>
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
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={handleViewAll}
                style={{
                  flex: '1',
                  padding: '15px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ดูข้อมูลทั้งหมด
              </button>
              <button
                onClick={handleServiceNext}
                style={{
                  flex: '2',
                  padding: '15px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                เริ่มประเมินใหม่
              </button>
            </div>
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

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          color: '#333',
          fontSize: '24px'
        }}>
          ระบบบันทึกข้อมูล Sales
        </h1>

        {/* Progress Bar */}
        {currentStep < 5 && (
          <div style={{ 
            marginBottom: '30px',
            padding: '10px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ 
                color: currentStep >= 1 ? '#007bff' : '#6c757d',
                fontWeight: currentStep >= 1 ? 'bold' : 'normal'
              }}>
                1. เลือกบริการ
              </span>
              <span style={{ 
                color: currentStep >= 2 ? '#007bff' : '#6c757d',
                fontWeight: currentStep >= 2 ? 'bold' : 'normal'
              }}>
                2. กรอกข้อมูล
              </span>
              <span style={{ 
                color: currentStep >= 3 ? '#007bff' : '#6c757d',
                fontWeight: currentStep >= 3 ? 'bold' : 'normal'
              }}>
                3. แนบรูปภาพ
              </span>
              <span style={{ 
                color: currentStep >= 4 ? '#007bff' : '#6c757d',
                fontWeight: currentStep >= 4 ? 'bold' : 'normal'
              }}>
                4. สรุปผล
              </span>
            </div>
          </div>
        )}

        {renderCurrentStep()}
      </div>
    </div>
  );
}