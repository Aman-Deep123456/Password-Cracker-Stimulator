
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { User, Fingerprint, CheckCircle, AlertTriangle } from "lucide-react";

interface BiometricDetectionProps {
  isActive: boolean;
  onComplete: (cracked: boolean) => void;
}

const BiometricDetection = ({ isActive, onComplete }: BiometricDetectionProps) => {
  const [faceProgress, setFaceProgress] = useState(0);
  const [fingerprintProgress, setFingerprintProgress] = useState(0);
  const [currentScan, setCurrentScan] = useState<"face" | "fingerprint" | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [fingerprintDetected, setFingerprintDetected] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    // Start face detection
    setCurrentScan("face");
    const faceInterval = setInterval(() => {
      setFaceProgress(prev => {
        const newProgress = prev + Math.random() * 15 + 5;
        if (newProgress >= 100) {
          clearInterval(faceInterval);
          setFaceDetected(true);
          setTimeout(() => startFingerprintScan(), 1000);
          return 100;
        }
        return newProgress;
      });
    }, 200);

    const startFingerprintScan = () => {
      setCurrentScan("fingerprint");
      const fingerprintInterval = setInterval(() => {
        setFingerprintProgress(prev => {
          const newProgress = prev + Math.random() * 12 + 3;
          if (newProgress >= 100) {
            clearInterval(fingerprintInterval);
            setFingerprintDetected(true);
            setTimeout(() => {
              setIsComplete(true);
              onComplete(true);
            }, 1500);
            return 100;
          }
          return newProgress;
        });
      }, 300);
    };

    return () => {
      clearInterval(faceInterval);
    };
  }, [isActive, onComplete]);

  return (
    <Card className="bg-gray-800 border-red-400/30">
      <CardHeader>
        <CardTitle className="text-red-400 flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>Biometric Security Breach</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Face Detection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className={`w-5 h-5 ${currentScan === "face" ? "text-red-400" : faceDetected ? "text-green-400" : "text-gray-500"}`} />
              <span className="text-gray-300">Facial Recognition</span>
            </div>
            {faceDetected && <CheckCircle className="w-5 h-5 text-green-400" />}
            {currentScan === "face" && !faceDetected && <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Scanning facial features...</span>
              <span className="text-red-400">{Math.round(faceProgress)}%</span>
            </div>
            <Progress value={faceProgress} className="h-2" />
          </div>
          {faceDetected && (
            <div className="text-sm text-green-400 animate-pulse">
              ✓ Face pattern matched - Security bypassed
            </div>
          )}
        </div>

        {/* Fingerprint Detection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Fingerprint className={`w-5 h-5 ${currentScan === "fingerprint" ? "text-red-400" : fingerprintDetected ? "text-green-400" : "text-gray-500"}`} />
              <span className="text-gray-300">Fingerprint Analysis</span>
            </div>
            {fingerprintDetected && <CheckCircle className="w-5 h-5 text-green-400" />}
            {currentScan === "fingerprint" && !fingerprintDetected && <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Analyzing ridge patterns...</span>
              <span className="text-red-400">{Math.round(fingerprintProgress)}%</span>
            </div>
            <Progress value={fingerprintProgress} className="h-2" />
          </div>
          {fingerprintDetected && (
            <div className="text-sm text-green-400 animate-pulse">
              ✓ Biometric signature cloned - Access granted
            </div>
          )}
        </div>

        {isComplete && (
          <div className="p-4 bg-red-400/10 border border-red-400 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-semibold">Biometric Security Compromised!</span>
            </div>
            <p className="text-sm text-gray-300">
              Both facial recognition and fingerprint security have been bypassed using advanced spoofing techniques.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BiometricDetection;
