import { describe, expect, it } from 'vitest';
import { parseVoice, savingsStat, spokenDays, voiceQty, VOICE_SAMPLES } from './v2';

const today = new Date(2026, 10, 21); // Saturday, November 21 2026

describe('parseVoice', () => {
  it('reads item, brand, count, size and expiration', () => {
    const v = parseVoice('Two half gallons of Horizon organic milk, expires next Friday', today)!;
    expect(v).toMatchObject({ name: 'Milk', brand: 'Horizon', count: 2, size: 'half gallon', days: 6, known: true });
    expect(voiceQty(v)).toBe('2 half gallons');
  });

  it('turns a dozen into a count and reads a month and day', () => {
    const v = parseVoice('A dozen Vital Farms eggs, best by December 12', today)!;
    expect(v).toMatchObject({ name: 'Eggs', brand: 'Vital Farms', count: 12, size: '', days: 21 });
    expect(voiceQty(v)).toBe('12');
  });

  it('reads weights and relative dates', () => {
    expect(parseVoice('One pound of Driscoll’s strawberries', today)).toMatchObject({ name: 'Strawberries', count: 1, size: 'pound', days: null });
    expect(parseVoice('32 ounce tub of Chobani yogurt, good for 2 weeks', today)).toMatchObject({ name: 'Yogurt', brand: 'Chobani', count: 32, size: 'ounce', days: 14 });
    expect(parseVoice('3 bags of spinach expiring tomorrow', today)).toMatchObject({ name: 'Spinach', count: 3, size: 'bag', days: 1 });
  });

  it('keeps an unknown food as said', () => {
    expect(parseVoice('two jars of kimchi', today)).toMatchObject({ name: 'Kimchi', count: 2, size: 'jar', known: false });
  });

  it('parses every sample', () => {
    for (const s of VOICE_SAMPLES) expect(parseVoice(s, today)?.known).toBe(true);
  });

  it('dates: weekday, numeric, in N days', () => {
    expect(spokenDays('friday', today)).toBe(6);
    expect(spokenDays('saturday', today)).toBe(7);
    expect(spokenDays('11/30', today)).toBe(9);
    expect(spokenDays('in five days', today)).toBe(5);
  });
});

describe('savingsStat', () => {
  it('scales with the period and stays believable', () => {
    for (let i = 0; i < 50; i++) {
      const s = savingsStat();
      const days = { week: 7, '2 weeks': 14, month: 30, '3 months': 90 }[s.period]!;
      expect(s.dollars / days).toBeGreaterThan(1);
      expect(s.dollars / days).toBeLessThan(2.1);
      expect(s.lbs).toBeLessThan(s.dollars);
    }
  });
});
