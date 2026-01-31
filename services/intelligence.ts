
import * as tf from '@tensorflow/tfjs';
import { StudySession, StudyStep } from '../types';

/**
 * Gemdi Intelligence Service
 * Uses TensorFlow.js to correlate content style with student confidence.
 */
export const intelligenceService = {
  // Extract numerical features from study content
  extractFeatures(steps: StudyStep[]): number[] {
    const combinedNotes = steps.map(s => s.detailedNotes).join(' ');
    const wordCount = combinedNotes.split(/\s+/).length;
    const bulletCount = (combinedNotes.match(/[-*]/g) || []).length;
    const headerCount = (combinedNotes.match(/[:]/g) || []).length;
    
    // Normalized features
    return [
      wordCount / 1000,      // Length feature
      bulletCount / 100,     // Formatting density
      headerCount / 50       // Structural density
    ];
  },

  async learnFromSessions(sessions: StudySession[]): Promise<string> {
    const ratedSessions = sessions.filter(s => s.performanceRating && s.studyPlan);
    if (ratedSessions.length < 2) return "Initial learning phase: Provide feedback to optimize your notes.";

    try {
      // 1. Prepare Training Data
      const xs_data = ratedSessions.map(s => this.extractFeatures(s.studyPlan!.steps));
      const ys_data = ratedSessions.map(s => [s.performanceRating! / 5.0]); // Normalize rating to 0-1

      const xs = tf.tensor2d(xs_data);
      const ys = tf.tensor2d(ys_data);

      // 2. Build Model
      const model = tf.sequential();
      model.add(tf.layers.dense({ units: 8, activation: 'relu', inputShape: [3] }));
      model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
      model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

      // 3. Train
      await model.fit(xs, ys, { epochs: 50, verbose: 0 });

      // 4. Analyze Weights to Generate Preference Insights
      const weights = model.getWeights()[0].arraySync() as number[][];
      
      // Simple logic: higher weights in first layer for certain inputs indicates importance
      const importance = [0, 0, 0];
      weights.forEach(neuronWeights => {
        neuronWeights.forEach((w, i) => importance[i] += Math.abs(w));
      });

      const maxImportance = Math.max(...importance);
      const styleIndex = importance.indexOf(maxImportance);

      let insight = "Neural Insights: ";
      if (styleIndex === 0) insight += "You respond best to comprehensive, deep-dive explanations.";
      else if (styleIndex === 1) insight += "You learn significantly faster with concise bullet points and lists.";
      else insight += "Structured headers and clear hierarchies improve your retention.";

      return insight;
    } catch (e) {
      console.error("TFJS Learning Error:", e);
      return "Refining neural profile...";
    }
  },

  getPromptInstruction(preferenceString: string): string {
    if (preferenceString.includes("Initial")) return "";
    return `Optimization Insight for this specific student: ${preferenceString}. Tailor the "detailedNotes" length and structure to match this preference exactly.`;
  }
};
