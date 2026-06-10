import { blockText, getPageContent } from "./page-content";
import { getProducts, productImage } from "./products/product-data";
import { getSiteSettings, whatsappLink } from "./site-settings";

const defaultHero = "Industrial Water Monitoring & Process Automation Solutions";
const defaultSummary =
  "FUNEL supplies online water quality analyzers, digital sensors, controllers, automation cabinets and integrated monitoring systems for municipal water, wastewater and industrial process water projects.";

const applications = [
  [
    "Municipal Water",
    "Intake water, sedimentation, filtration, disinfection and clear water monitoring.",
  ],
  [
    "Wastewater Treatment",
    "Inlet, aeration tank, sludge concentration, final effluent and discharge compliance.",
  ],
  [
    "Industrial Process Water",
    "Cooling water, boiler water, chemical dosing, recycling water and discharge monitoring.",
  ],
  [
    "Surface Water & Environment",
    "River, lake, groundwater and environmental station applications.",
  ],
  [
    "Aquaculture",
    "DO, pH, temperature, ammonia and water safety monitoring for farms.",
  ],
  [
    "System Integrators",
    "Online analyzers, sensors, controllers, cabinet and data integration support.",
  ],
];

const support = [
  [
    "Configuration first",
    "Confirm parameter, water type, output signal, measuring range, quantity and installation before model selection.",
  ],
  [
    "Datasheet ready",
    "Get datasheets, wiring notes, communication options and quotation details for engineering comparison.",
  ],
  [
    "Sample support",
    "Discuss sample needs, OEM labels, spare parts and distributor project requirements.",
  ],
  [
    "System integration",
    "Support analyzers, sensors, controllers, PLC cabinets, Modbus, 4-20 mA and SCADA-connected projects.",
  ],
];

const process = [
  ["1", "Sampling", "Sampling point, pretreatment and site condition review."],
  ["2", "Analysis", "Analyzer, sensor, controller and range configuration."],
  ["3", "Cabinet", "Power, wiring, PLC cabinet and field installation support."],
  ["4", "Data", "RS485 Modbus, 4-20 mA, alarms, gateway and SCADA layer."],
  ["5", "Service", "Quotation, documents, OEM support and follow-up guidance."],
];

const projects = [
  [
    "Water Treatment Plant Monitoring",
    "Multi-parameter online monitoring for inlet, process and outlet water quality.",
  ],
  [
    "Wastewater Automation Control",
    "PLC cabinet, field instruments and process data acquisition for stable operation.",
  ],
  [
    "Industrial Discharge Monitoring",
    "Integrated station for COD, ammonia, pH, flow and compliance monitoring.",
  ],
];

const faqs = [
  [
    "What should I send for a quotation?",
    "Water type, parameter, measuring range, quantity, output signal, installation site and target application.",
  ],
  [
    "Can FUNEL support OEM or system integrator projects?",
    "Yes. We support product selection, controller configuration, private label discussion and project-based quotation.",
  ],
  [
    "Which communication outputs are available?",
    "Common project configurations include 4-20 mA, relay alarm and RS485 Modbus. Final options depend on the selected analyzer and controller.",
  ],
  [
    "Can I request datasheets before ordering?",
    "Yes. Datasheets, configuration suggestions and wiring information can be provided after confirming the target product and application.",
  ],
];

export async function generateMetadata() {
  const home = await getPageContent("home");

  return {
