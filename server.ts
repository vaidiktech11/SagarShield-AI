import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    engine: 'SagarShield AI Predictive Vulnerability Engine',
    model: 'gemini-3.8-flash',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Endpoint: Assess Asset Vulnerability with Gemini 3.7 / 3.8 Flash
app.post('/api/assess-asset', async (req, res) => {
  try {
    const { asset, cyclone, currentWaterLevel } = req.body;
    if (!asset || !cyclone) {
      return res.status(400).json({ error: 'Asset and Cyclone profile are required' });
    }

    const elevation = Number(asset.elevationMeters) || 2.0;
    const waterLevel = Number(currentWaterLevel) || Number(cyclone.peakSurgeHeightMeters) || 4.2;
    const surgeDelta = Number((elevation - waterLevel).toFixed(2));
    const isFlooded = surgeDelta < 0;

    const ai = getGeminiClient();

    if (ai) {
      const prompt = `You are SagarShield AI, the predictive vulnerability reasoning core for coastal disaster management along India's coastline.
Analyze the following coastal infrastructure asset against the simulated cyclone storm surge inundation:

Asset Name: ${asset.name}
Asset Category: ${asset.category} (${asset.capacityOrSpecs || 'Standard'})
State & District: ${asset.state}, ${asset.district} (Panchayat: ${asset.panchayat || 'Coastal Zone'})
Copernicus 30m DEM Elevation: ${elevation} meters above mean sea level
Predicted Storm Surge Water Level: ${waterLevel} meters
Elevation vs Surge Delta: ${surgeDelta} meters (${isFlooded ? 'SUBMERGED/INUNDATED by ' + Math.abs(surgeDelta) + 'm' : 'CLEARANCE of +' + surgeDelta + 'm'})
Approaching Storm: ${cyclone.name} (Max Wind: ${cyclone.maxWindSpeedKmph} km/h, Central Pressure: ${cyclone.lowestPressureHpa} hPa)
Backup Power Available: ${asset.backupPowerAvailable ? 'Yes' : 'No'}

Perform a rigorous engineering vulnerability audit:
1. Assign a calibrated Vulnerability Index from 1.0 to 10.0 (where 10 is critical catastrophic failure/submersion).
2. Determine risk severity: "high" (if flooded or delta < 0.5m), "moderate" (if delta 0.5m-1.5m), or "stable" (delta > 1.5m).
3. Evaluate Operational Impact: electrical switchgear flashover risk, saltwater corrosion, road access severance, patient triage risks.
4. Prescribe 3-4 tactical anticipatory hardening measures (e.g. sandbagging heights, mobile genset placement, early isolation of feeders, patient rerouting).
5. Specify Recommended Evacuation/Action Lead Time (hours prior to landfall) and Priority Level.`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are an elite coastal disaster management engineer and hydro-spatial specialist for NDMA / SDMA India. Respond in structured JSON only.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                vulnerabilityScore: { type: Type.NUMBER, description: 'Score between 1.0 and 10.0' },
                severity: { type: Type.STRING, description: 'high, moderate, or stable' },
                floodingProbabilityPercent: { type: Type.NUMBER, description: '0 to 100 percentage' },
                powerOutageRisk: { type: Type.STRING, description: 'Imminent, Likely, or Unlikely' },
                accessSeveranceRisk: { type: Type.STRING, description: 'Severed, Restricted, or Accessible' },
                evacuationCorridorSafe: { type: Type.BOOLEAN },
                operationalImpact: { type: Type.STRING },
                tacticalHardeningMeasures: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                aiReasoning: { type: Type.STRING },
                recommendedEvacuationTimeHours: { type: Type.NUMBER },
                priorityLevel: { type: Type.STRING }
              },
              required: [
                'vulnerabilityScore',
                'severity',
                'floodingProbabilityPercent',
                'powerOutageRisk',
                'accessSeveranceRisk',
                'operationalImpact',
                'tacticalHardeningMeasures',
                'aiReasoning',
                'priorityLevel'
              ]
            }
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({
            ...parsed,
            assetId: asset.id,
            assetName: asset.name,
            elevationMeters: elevation,
            predictedSurgeWaterLevel: waterLevel,
            surgeDeltaMeters: surgeDelta,
            source: 'Gemini 3.7/3.8 Flash Spatial Reasoning Core'
          });
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, providing rule-based spatial assessment fallback:', geminiError);
      }
    }

    // High-accuracy analytical fallback if Gemini API is offline or key not provided
    const calculatedScore = isFlooded
      ? Math.min(10, Math.max(7.5, 7.5 + Math.abs(surgeDelta) * 1.5))
      : surgeDelta < 0.6
      ? 6.8
      : Math.max(1.8, 5.0 - surgeDelta);

    const severity = calculatedScore >= 7.0 ? 'high' : calculatedScore >= 4.5 ? 'moderate' : 'stable';
    const floodProb = isFlooded ? 95 : surgeDelta < 0.5 ? 75 : surgeDelta < 1.2 ? 35 : 10;
    const powerRisk = isFlooded ? 'Imminent' : surgeDelta < 0.8 ? 'Likely' : 'Unlikely';
    const accessRisk = isFlooded ? 'Severed' : surgeDelta < 0.6 ? 'Restricted' : 'Accessible';

    const hardeningMeasures: string[] = [];
    if (asset.category === 'substation') {
      const barrierHeight = Math.max(0.6, Number((waterLevel - elevation + 0.5).toFixed(1)));
      hardeningMeasures.push(`Erect perimeter sandbag barrier to height +${barrierHeight}m above pad`);
      hardeningMeasures.push('Lock out and tag out 33kV coastal feeder switchgear by T-6h to prevent catastrophic saltwater flashover');
      hardeningMeasures.push('Pre-position containerized diesel generator on reinforced high ground (>5.0m DEM)');
    } else if (asset.category === 'hospital') {
      hardeningMeasures.push('Initiate priority transfer of ICU and oxygen-dependent patients to inland district hospital');
      hardeningMeasures.push('Transfer emergency medicines, anti-venom, and blood bank stock to 2nd floor or higher');
      hardeningMeasures.push('Engage elevated rooftop auxiliary fuel supply for critical care telemetry');
    } else if (asset.category === 'road') {
      hardeningMeasures.push(`Position warning barricades and traffic diversion at chainage point before water reaches +0.3m`);
      hardeningMeasures.push('Station ODRAF / NDRF inflatable rescue boats (IRBs) at approach causeways');
      hardeningMeasures.push('Clear all drainage culverts of silt and vegetative debris immediately');
    } else {
      hardeningMeasures.push('Inspect emergency food and potable drinking water buffer for 72 hours');
      hardeningMeasures.push('Secure heavy shutters and reinforce cyclone roof tie-down trusses');
      hardeningMeasures.push('Test satellite phone communication link with District Emergency Operations Center (DEOC)');
    }

    return res.json({
      assetId: asset.id,
      assetName: asset.name,
      vulnerabilityScore: Number(calculatedScore.toFixed(1)),
      severity,
      elevationMeters: elevation,
      predictedSurgeWaterLevel: waterLevel,
      surgeDeltaMeters: surgeDelta,
      floodingProbabilityPercent: floodProb,
      powerOutageRisk: powerRisk,
      accessSeveranceRisk: accessRisk,
      evacuationCorridorSafe: !isFlooded && surgeDelta > 0.4,
      operationalImpact: isFlooded
        ? `Water level exceeds terrain crest by ${Math.abs(surgeDelta).toFixed(1)}m. Severe inundation will compromise structural foundation and submerge electrical conduits.`
        : `Terrain holds a clearance margin of ${surgeDelta.toFixed(1)}m above peak surge wave runup. High wind shear and perimeter wave runup may cause localized splash-over.`,
      tacticalHardeningMeasures: hardeningMeasures,
      aiReasoning: `Spatial intersection of Copernicus 30m DEM elevation (${elevation}m) with IMD peak surge envelope (${waterLevel}m) indicates ${isFlooded ? 'high inundation risk' : 'manageable freeboard margin'}.`,
      recommendedEvacuationTimeHours: isFlooded ? 6 : 3,
      priorityLevel: isFlooded ? 'P0 - Immediate Evacuate' : severity === 'moderate' ? 'P1 - Deploy Defenses' : 'P2 - Standby & Monitor',
      source: 'Deterministic Hydro-Spatial Reasoning Engine'
    });
  } catch (error: any) {
    console.error('Error in /api/assess-asset:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Endpoint: Synthesize District Anticipatory Plan
app.post('/api/synthesize-district-plan', async (req, res) => {
  try {
    const { cyclone, timeOffsetHours, assets } = req.body;
    const ai = getGeminiClient();

    if (ai) {
      const prompt = `Synthesize an Anticipatory Action Plan for District Disaster Administrators along the Indian coast:
Cyclone: ${cyclone?.name || 'Cyclone Dana'}
Current Timeline: T${timeOffsetHours >= 0 ? '+' + timeOffsetHours : timeOffsetHours}h relative to Landfall
Peak Storm Surge: ${cyclone?.peakSurgeHeightMeters || 4.8}m
Critical Coastal Assets exposed: ${(assets || []).map((a: any) => `${a.name} (Elev: ${a.elevationMeters}m)`).join(', ')}

Provide:
1. Executive situation summary
2. Top 3 physical terrain choke points that will sever evacuation corridors early
3. Power grid isolation sequence
4. Recommended evacuation window deadline
Return in clean JSON format.`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are the Chief Disaster Operations Advisor to the State Relief Commissioner of Odisha / West Bengal. Return JSON.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                executiveSummary: { type: Type.STRING },
                chokePoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                powerGridDirectives: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                evacuationDeadline: { type: Type.STRING },
                highRiskPanchayats: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['title', 'executiveSummary', 'chokePoints', 'powerGridDirectives', 'evacuationDeadline']
            }
          }
        });

        if (response.text) {
          return res.json({
            ...JSON.parse(response.text),
            source: 'Gemini 3.7/3.8 Flash'
          });
        }
      } catch (err) {
        console.warn('Gemini plan synthesis fallback:', err);
      }
    }

    // Default analytical plan
    res.json({
      title: 'Anticipatory Disaster Directive: Pre-Landfall Coastal Corridors',
      executiveSummary: `Hydro-spatial analysis indicates storm surge will breach coastal dikes 6 hours ahead of eye landfall. Submerged causeways will trap residents unless evacuated immediately.`,
      chokePoints: [
        'SH-9 Chandbali - Dhamra Highway culvert at km 42 (floods at T-6h)',
        'Talchua - Baitarani estuary causeway (overtopped by +1.4m saltwater)',
        'Kendrapara Rajnagar tidal bridge approach (bank scouring risk)'
      ],
      powerGridDirectives: [
        'De-energize 33kV coastal feeder to prevent terminal explosion',
        'Switch Chandbali Primary Health Center to dedicated 45kVA elevated genset',
        'Isolate all ground-mounted transformer boxes in 0-3m elevation zone'
      ],
      evacuationDeadline: 'Complete all evacuations 4 hours prior to landfall',
      highRiskPanchayats: ['Dhamra', 'Talchua', 'Kaitha', 'Chandnipal', 'Karanjamala'],
      source: 'Deterministic SagarShield Protocol'
    });
  } catch (error: any) {
    console.error('Error in /api/synthesize-district-plan:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Generate Vernacular Multilingual Dispatch
app.post('/api/dispatch-advisory', async (req, res) => {
  try {
    const { cycloneName, district, customNotes } = req.body;
    const ai = getGeminiClient();

    if (ai) {
      const prompt = `Generate localized emergency disaster warnings in 5 languages (English, Odia, Telugu, Bengali, Hindi) for District Magistrates and Coastal Gram Panchayats.
Cyclone: ${cycloneName || 'Cyclone Dana'}
District: ${district || 'Bhadrak / Kendrapara Coast'}
Context Notes: ${customNotes || 'Surge inundation up to 4.8m; coastal roads cut off 6 hours prior to landfall'}.

For each language, provide:
1. Official Administrative Directive for District Magistrate & BDOs
2. Direct, urgent Panchayat public SMS / WhatsApp alert text (concise, clear, instructing evacuation to cyclone shelters with emergency kit).`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are an expert multilingual disaster warning communicator for the Government of India. Provide authentic, highly natural native translations in Odia, Telugu, Bengali, Hindi, and English. Output JSON only.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                english: {
                  type: Type.OBJECT,
                  properties: {
                    dmDirective: { type: Type.STRING },
                    panchayatSms: { type: Type.STRING }
                  },
                  required: ['dmDirective', 'panchayatSms']
                },
                odia: {
                  type: Type.OBJECT,
                  properties: {
                    dmDirective: { type: Type.STRING },
                    panchayatSms: { type: Type.STRING }
                  },
                  required: ['dmDirective', 'panchayatSms']
                },
                telugu: {
                  type: Type.OBJECT,
                  properties: {
                    dmDirective: { type: Type.STRING },
                    panchayatSms: { type: Type.STRING }
                  },
                  required: ['dmDirective', 'panchayatSms']
                },
                bengali: {
                  type: Type.OBJECT,
                  properties: {
                    dmDirective: { type: Type.STRING },
                    panchayatSms: { type: Type.STRING }
                  },
                  required: ['dmDirective', 'panchayatSms']
                },
                hindi: {
                  type: Type.OBJECT,
                  properties: {
                    dmDirective: { type: Type.STRING },
                    panchayatSms: { type: Type.STRING }
                  },
                  required: ['dmDirective', 'panchayatSms']
                }
              },
              required: ['english', 'odia', 'telugu', 'bengali', 'hindi']
            }
          }
        });

        if (response.text) {
          return res.json({
            ...JSON.parse(response.text),
            source: 'Gemini 3.7/3.8 Flash Multilingual Dispatch Core'
          });
        }
      } catch (err) {
        console.warn('Gemini translation fallback:', err);
      }
    }

    // Default pre-computed localized broadcast
    res.json({
      english: {
        dmDirective: `MANDATORY EVACUATION: Evacuate all habitations within 5km of coastline by T-4h. De-energize 33kV coastal feeder to prevent saltwater fire. Position rescue boats at SH-9 causeway.`,
        panchayatSms: `EMERGENCY ALERT: Cyclone approaching with 4.5m storm surge. Do not stay in thatched houses. Move immediately to nearest Pucca Cyclone Shelter with dry food, water, and medicine. Dial 1077 for help.`
      },
      odia: {
        dmDirective: `ଜିଲ୍ଲାପାଳଙ୍କ ନିର୍ଦ୍ଦେଶ: ଉପକୂଳ ୫ କିଲୋମିଟର ପରିସର ମଧ୍ୟରେ ଥିବା ସମସ୍ତ ଗ୍ରାମବାସୀଙ୍କୁ ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳକୁ ସନ୍ଧ୍ୟା ସୁଦ୍ଧା ସ୍ଥାନାନ୍ତର କରନ୍ତୁ। ଲୁଣା ପାଣି ବିପଦକୁ ଏଡାଇବା ପାଇଁ ୩୩ କେଭି ବିଦ୍ୟୁତ ଲାଇନ ବନ୍ଦ କରନ୍ତୁ।`,
        panchayatSms: `ଜରୁରୀ ସତର୍କ ସୂଚନା: ବାତ୍ୟା ପ୍ରଭାବରେ ସମୁଦ୍ର ପାଣି ଗାଁ ଭିତରକୁ ୪ ମିଟର ପଶିବ। କଚ୍ଚା ଘରେ ରୁହନ୍ତୁ ନାହିଁ। ଶୀଘ୍ର ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳକୁ ଯାଆନ୍ତୁ। ଖାଦ୍ୟ ଓ ପାଣି ସାଙ୍ଗରେ ନିଅନ୍ତୁ। ଜରୁରୀ ସାହାଯ୍ୟ ପାଇଁ ୧୦୭୭ ରେ କଲ କରନ୍ତୁ।`
      },
      telugu: {
        dmDirective: `కలెక్టర్ ఆదేశాలు: సముద్ర తీరానికి 5 కి.మీ దూరంలో ఉన్న ప్రజలను వెంటనే తుఫాను పునరావాస కేంద్రాలకు తరలించండి. విద్యుత్ ప్రమాదాలు జరగకుండా 33kV లైన్లను నిలిపివేయండి.`,
        panchayatSms: `అత్యవసర హెచ్చరిక: తీరంలో భారీ ఎత్తున తుఫాను అలలు ఎగసిపడే ప్రమాదం ఉంది. మట్టి ఇళ్లలో ఉండవద్దు. వెంటనే సమీపంలోని తుఫాను షెల్టర్‌కు చేరుకోండి. అత్యవసర సాయానికి 1077 కు డయల్ చేయండి.`
      },
      bengali: {
        dmDirective: `জেলাশাসকের জরুরি নির্দেশিকা: উপকূলের ৫ কিমির মধ্যে বসবাসকারী সমস্ত মানুষকে অবিলম্বে পাকা সাইক্লোন সেন্টারে স্থানান্তর করুন। নোনা জলের স্পর্শে দুর্ঘটনা এড়াতে ৩৩ কেভি বিদ্যুৎ বিচ্ছিন্ন করুন।`,
        panchayatSms: `জরুরি সতর্কতা: প্রবল জলোচ্ছ্বাসের কারণে গ্রামে নোনা জল ঢুকে পড়তে পারে। কাঁচা বাড়িতে একদম থাকবেন না। শুকনো খাবার নিয়ে দ্রুত নিকটবর্তী সাইক্লোন সেন্টারে যান। জরুরি প্রয়োজনে ১০৭৭ নম্বরে ফোন করুন।`
      },
      hindi: {
        dmDirective: `जिलाधिकारी निर्देश: तटीय क्षेत्र के 5 किमी के भीतर सभी बस्तियों को शाम तक पक्के चक्रवात आश्रय स्थलों में खाली कराएं। शॉर्ट सर्किट रोकने हेतु 33kV तटीय ग्रिड बंद करें।`,
        panchayatSms: `अति आवश्यक सूचना: चक्रवाती तूफ़ानी लहरों से समुद्र का पानी गाँव में प्रवेश कर सकता है। कच्चे घरों में न रहें। तुरंत नजदीकी चक्रवात राहत केंद्र पहुँचें। आपातकालीन मदद हेतु 1077 पर कॉल करें।`
      },
      source: 'SagarShield Vernacular Dispatch Engine'
    });
  } catch (error: any) {
    console.error('Error in /api/dispatch-advisory:', error);
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware for development vs static production serve
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SagarShield AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
