// JANSAATHI AI - AI Provider Factory
// Selects Gemini Flash when configured, or DeterministicExtractor for offline/zero-cost operation.

import { IAIProvider } from './AIProvider';
import { GeminiProvider } from './GeminiProvider';
import { DeterministicExtractor } from './DeterministicExtractor';

export class AIFactory {
  public static getProvider(): IAIProvider {
    const gemini = new GeminiProvider();
    if (gemini.isAvailable()) {
      return gemini;
    }
    return new DeterministicExtractor();
  }
}
