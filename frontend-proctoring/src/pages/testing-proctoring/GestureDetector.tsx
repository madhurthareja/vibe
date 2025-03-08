import React, { useEffect, useState } from "react";
import {
  GestureRecognizer,
  FilesetResolver
} from "@mediapipe/tasks-vision";

interface GestureDetectorProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  trigger: boolean;
}

const GestureDetector: React.FC<GestureDetectorProps> = ({ videoRef, trigger }) => {
  const [gesture, setGesture] = useState<string | null>(null);
  const [gestureRecognizer, setGestureRecognizer] = useState<GestureRecognizer | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("[GestureDetector] 🔄 Loading MediaPipe GestureRecognizer...");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        console.log("[GestureDetector] ✅ MediaPipe Vision loaded!");

        const recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "CPU" // ✅ Avoids WebGL issues
          },
          runningMode: "IMAGE",
        });

        setGestureRecognizer(recognizer);
        setModelLoaded(true);
        console.log("[GestureDetector] ✅ GestureRecognizer Model Loaded!");
      } catch (error) {
        console.error("[GestureDetector] ❌ Failed to load Gesture Recognizer:", error);
      }
    };

    loadModel();
  }, []);

  useEffect(() => {
    if (!gestureRecognizer) {
      console.warn("[GestureDetector] ⚠️ Model not initialized yet.");
      return;
    }
    if (!videoRef.current) {
      console.warn("[GestureDetector] ❌ No video reference detected.");
      return;
    }
    if (!trigger) {
      console.log("[GestureDetector] ⏸️ Gesture detection paused.");
      return;
    }

    console.log("[GestureDetector] 🎥 Capturing frame for gesture recognition...");

    const processFrame = async () => {
      try {
        const video = videoRef.current;
        console.log("[GestureDetector] 🔍 Running inference on video frame...");

        const results = await gestureRecognizer.recognize(video);
        console.log("[GestureDetector] 📝 Results:", results);

        if (results.gestures.length > 0) {
          setGesture(results.gestures[0][0].categoryName);
          console.log(`[GestureDetector] ✋ Gesture Detected: ${results.gestures[0][0].categoryName}`);
        } else {
          setGesture("No Gesture Detected ❌");
          console.log("[GestureDetector] ❌ No gesture detected.");
        }
      } catch (error) {
        console.error("[GestureDetector] ❌ Error processing frame:", error);
      }
    };

    processFrame();

    return () => {
      console.log("[GestureDetector] 🛑 Stopping gesture detection.");
      setGesture(null);
    };
  }, [trigger, videoRef, gestureRecognizer, modelLoaded]);

  return (
    <div className="text-center mt-4">
      <h2 className="text-lg font-bold">Gesture Detection</h2>
      {modelLoaded ? (
        <p className="text-blue-600">{gesture || "Waiting for trigger..."}</p>
      ) : (
        <p className="text-red-600">Loading Model...</p>
      )}
    </div>
  );
};

export default GestureDetector;
