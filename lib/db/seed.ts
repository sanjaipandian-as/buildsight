import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env file
config({ path: resolve(process.cwd(), ".env") });

console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

import { projects } from "./schema";
import { assemblySessions } from "./schema";

const seedProjects = [
  {
    title: "Arduino Starter Kit",
    description: "Build your first Arduino circuit with LED, resistor and breadboard.",
    category: "electronics" as const,
    difficulty: "beginner" as const,
    totalSteps: 6,
    estMinutes: 30,
    isPublic: true,
    thumbnail: "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400",
    steps: [
      { step_number: 1, title: "Gather components", instruction: "Lay out the Arduino board, breadboard, LED, 220-ohm resistor and jumper wires on your workspace.", visual_cues: ["arduino board", "breadboard", "LED", "resistor", "jumper wires"], ai_prompt_hint: "Check if all 5 components are visible on the workspace." },
      { step_number: 2, title: "Insert LED into breadboard", instruction: "Push the LED into the breadboard with the longer leg (anode) in row 10, column E and shorter leg (cathode) in row 9.", visual_cues: ["LED in breadboard", "long leg", "short leg"], ai_prompt_hint: "Verify LED is inserted with correct polarity." },
      { step_number: 3, title: "Connect resistor", instruction: "Insert the 220-ohm resistor from row 9, column A to the negative rail of the breadboard.", visual_cues: ["resistor", "negative rail", "breadboard"], ai_prompt_hint: "Resistor should connect row 9 to the ground rail." },
      { step_number: 4, title: "Ground wire", instruction: "Connect a black jumper wire from the breadboard negative rail to the GND pin on the Arduino.", visual_cues: ["black wire", "GND pin", "Arduino"], ai_prompt_hint: "Black wire should run from breadboard rail to Arduino GND." },
      { step_number: 5, title: "Signal wire", instruction: "Connect a red jumper wire from row 10, column A on the breadboard to pin 13 on the Arduino.", visual_cues: ["red wire", "pin 13", "breadboard row 10"], ai_prompt_hint: "Red wire connects breadboard row 10 to Arduino pin 13." },
      { step_number: 6, title: "Connect USB and verify", instruction: "Plug the Arduino into your computer via USB. The LED should blink with the built-in Blink sketch.", visual_cues: ["USB cable", "blinking LED", "powered Arduino"], ai_prompt_hint: "LED should be blinking once per second." },
    ],
  },
  {
    title: "IKEA KALLAX Shelf Unit",
    description: "Assemble the classic IKEA KALLAX 2x2 shelf unit step by step.",
    category: "furniture" as const,
    difficulty: "beginner" as const,
    totalSteps: 8,
    estMinutes: 45,
    isPublic: true,
    thumbnail: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400",
    steps: [
      { step_number: 1, title: "Unpack and identify parts", instruction: "Lay all parts on the floor. You need: 2 side panels, 1 top panel, 1 bottom panel, 1 middle shelf, 1 divider, screws, and dowels.", visual_cues: ["side panels", "shelves", "hardware bag"], ai_prompt_hint: "All major panels should be visible and unpacked." },
      { step_number: 2, title: "Insert dowels into side panel", instruction: "Press wooden dowels into the pre-drilled holes on the left side panel as marked in the manual.", visual_cues: ["dowels", "side panel", "pre-drilled holes"], ai_prompt_hint: "Dowels should be fully inserted into all marked holes." },
      { step_number: 3, title: "Attach top panel", instruction: "Align the top panel onto the dowels of the left side panel and press firmly until flush.", visual_cues: ["top panel", "flush connection", "no gap"], ai_prompt_hint: "Top panel should sit flush with no visible gap." },
      { step_number: 4, title: "Insert screws", instruction: "Hand-tighten the cam lock screws into the pre-drilled positions on the top panel using the included Allen key.", visual_cues: ["cam lock screws", "Allen key", "top panel holes"], ai_prompt_hint: "Screws should be visibly inserted and hand-tightened." },
      { step_number: 5, title: "Attach middle shelf", instruction: "Insert the middle horizontal shelf using dowels and cam locks at the midpoint of both side panels.", visual_cues: ["middle shelf", "horizontal", "midpoint"], ai_prompt_hint: "Middle shelf should be level and at the midpoint." },
      { step_number: 6, title: "Attach vertical divider", instruction: "Insert the vertical divider panel between the top and middle shelf to create the 2x2 grid.", visual_cues: ["vertical divider", "2x2 grid", "centre"], ai_prompt_hint: "Vertical divider should be centred and upright." },
      { step_number: 7, title: "Attach bottom panel", instruction: "Fit the bottom panel using dowels and cam locks to complete the frame.", visual_cues: ["bottom panel", "frame complete"], ai_prompt_hint: "Bottom panel should complete the rectangular frame." },
      { step_number: 8, title: "Attach backing and tighten", instruction: "Press the cardboard backing panel into place and tighten all cam lock screws with the Allen key.", visual_cues: ["backing panel", "Allen key", "tightening"], ai_prompt_hint: "Backing should be in place and all screws tight." },
    ],
  },
  {
    title: "Mechanical Keyboard Build",
    description: "Build a 65% custom mechanical keyboard from PCB to keycaps.",
    category: "electronics" as const,
    difficulty: "intermediate" as const,
    totalSteps: 7,
    estMinutes: 120,
    isPublic: true,
    thumbnail: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400",
    steps: [
      { step_number: 1, title: "Test PCB", instruction: "Connect PCB via USB and use VIA or QMK Toolbox to test every switch socket with metal tweezers. All pads should register a keypress.", visual_cues: ["PCB", "USB cable", "metal tweezers", "VIA software"], ai_prompt_hint: "PCB should be connected and software visible on screen." },
      { step_number: 2, title: "Install stabilisers", instruction: "Clip, lube, and install PCB-mount stabilisers into the 2u and larger positions before soldering any switches.", visual_cues: ["stabilisers", "large key positions", "stabiliser wire"], ai_prompt_hint: "Stabilisers should be visibly installed on PCB." },
      { step_number: 3, title: "Mount switches into plate", instruction: "Snap switches into the plate at each corner first, then fill in the remaining positions ensuring all pins are straight.", visual_cues: ["plate", "switches", "switch pins", "corner switches"], ai_prompt_hint: "Switches visible in plate with straight pins." },
      { step_number: 4, title: "Place plate onto PCB", instruction: "Align the plate+switches assembly onto the PCB ensuring all switch pins pass cleanly through the PCB holes.", visual_cues: ["plate on PCB", "switch pins through holes"], ai_prompt_hint: "Plate should sit flat on PCB with all pins visible." },
      { step_number: 5, title: "Solder switches", instruction: "Solder all switch pins to the PCB. Each solder joint should be shiny and volcano-shaped, not cold or balled.", visual_cues: ["soldering iron", "solder joints", "shiny joints"], ai_prompt_hint: "Solder joints should be shiny and complete on all switches." },
      { step_number: 6, title: "Assemble into case", instruction: "Mount the PCB+plate assembly into the keyboard case using the included screws and any foam layers.", visual_cues: ["case", "screws", "assembled keyboard"], ai_prompt_hint: "PCB should be mounted inside the case." },
      { step_number: 7, title: "Install keycaps", instruction: "Press keycaps onto switch stems starting from the spacebar row and working upward.", visual_cues: ["keycaps", "complete keyboard", "all keys present"], ai_prompt_hint: "All keycaps should be installed and aligned." },
    ],
  },
  {
    title: "Origami Paper Crane",
    description: "Fold a traditional Japanese paper crane using a single square sheet.",
    category: "craft" as const,
    difficulty: "beginner" as const,
    totalSteps: 10,
    estMinutes: 15,
    isPublic: true,
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    steps: [
      { step_number: 1, title: "Start with square paper", instruction: "Place a square sheet of origami paper colored side down on a flat surface.", visual_cues: ["square paper", "flat surface", "colored side down"], ai_prompt_hint: "Square paper should be visible and flat." },
      { step_number: 2, title: "Fold diagonally", instruction: "Fold the paper in half diagonally to form a triangle, crease well, then unfold.", visual_cues: ["diagonal fold", "triangle", "crease line"], ai_prompt_hint: "Diagonal crease should be visible on the paper." },
      { step_number: 3, title: "Fold other diagonal", instruction: "Fold the paper diagonally in the opposite direction, crease well, then unfold.", visual_cues: ["X crease pattern", "two diagonal lines"], ai_prompt_hint: "Two diagonal creases forming an X should be visible." },
      { step_number: 4, title: "Fold in half horizontally", instruction: "Flip the paper over. Fold in half horizontally, crease, and unfold.", visual_cues: ["horizontal fold", "crease line"], ai_prompt_hint: "Horizontal crease should be visible." },
      { step_number: 5, title: "Fold in half vertically", instruction: "Fold in half vertically, crease well, and unfold. You should now have a star pattern of creases.", visual_cues: ["vertical fold", "star crease pattern"], ai_prompt_hint: "Star pattern with multiple creases should be visible." },
      { step_number: 6, title: "Collapse into square base", instruction: "Bring all four corners together at the top, collapsing the paper into a smaller square shape (square base).", visual_cues: ["square base", "four layers", "diamond orientation"], ai_prompt_hint: "Paper should be collapsed into a layered square." },
      { step_number: 7, title: "Fold flaps to center", instruction: "With the open end pointing down, fold the left and right flaps to the center line. Flip and repeat on the other side.", visual_cues: ["flaps folded inward", "kite shape"], ai_prompt_hint: "Flaps should be folded to create a narrow kite shape." },
      { step_number: 8, title: "Fold and unfold top triangle", instruction: "Fold the top triangle down over the flaps, crease well, then unfold. This creates a guide crease.", visual_cues: ["triangle fold", "crease line"], ai_prompt_hint: "Triangle crease should be visible at the top." },
      { step_number: 9, title: "Petal fold", instruction: "Lift the bottom point up and fold along the creases, bringing the sides inward to form a long diamond (petal fold). Repeat on the other side.", visual_cues: ["long diamond", "petal fold", "narrow shape"], ai_prompt_hint: "Paper should form a long narrow diamond shape." },
      { step_number: 10, title: "Form head and wings", instruction: "Fold the top flaps down to form wings. Reverse fold one narrow point to form the head. Gently pull the wings apart.", visual_cues: ["wings spread", "crane head", "3D shape"], ai_prompt_hint: "Completed crane with wings and head should be visible." },
    ],
  },
  {
    title: "Raspberry Pi Media Center",
    description: "Set up a Raspberry Pi 4 as a home media center with LibreELEC.",
    category: "electronics" as const,
    difficulty: "intermediate" as const,
    totalSteps: 9,
    estMinutes: 60,
    isPublic: true,
    thumbnail: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400",
    steps: [
      { step_number: 1, title: "Gather components", instruction: "Collect Raspberry Pi 4, microSD card (16GB+), power supply, HDMI cable, case, and heatsinks.", visual_cues: ["Raspberry Pi", "microSD card", "power supply", "HDMI cable"], ai_prompt_hint: "All components should be visible on the workspace." },
      { step_number: 2, title: "Download LibreELEC", instruction: "On your computer, download the LibreELEC USB-SD Creator tool from libreelec.tv.", visual_cues: ["computer screen", "download page", "LibreELEC logo"], ai_prompt_hint: "LibreELEC download page should be visible on screen." },
      { step_number: 3, title: "Flash microSD card", instruction: "Insert the microSD card into your computer, run the LibreELEC tool, select your Pi model, and write the image.", visual_cues: ["microSD in adapter", "flashing software", "progress bar"], ai_prompt_hint: "Flashing software should show progress or completion." },
      { step_number: 4, title: "Install heatsinks", instruction: "Peel and stick the heatsinks onto the CPU, RAM, and USB controller chips on the Raspberry Pi.", visual_cues: ["heatsinks", "Raspberry Pi chips", "adhesive"], ai_prompt_hint: "Heatsinks should be attached to the main chips." },
      { step_number: 5, title: "Insert microSD card", instruction: "Remove the flashed microSD card from your computer and insert it into the microSD slot on the underside of the Raspberry Pi.", visual_cues: ["microSD card", "Pi underside", "card slot"], ai_prompt_hint: "MicroSD card should be fully inserted into the Pi." },
      { step_number: 6, title: "Connect HDMI and power", instruction: "Connect the HDMI cable from the Pi to your TV. Connect the power supply to the Pi. The Pi should boot automatically.", visual_cues: ["HDMI cable", "power cable", "TV connection"], ai_prompt_hint: "Cables should be connected and Pi should show power LED." },
      { step_number: 7, title: "Complete setup wizard", instruction: "Follow the on-screen LibreELEC setup wizard. Connect to Wi-Fi or Ethernet, set your timezone, and enable SSH if desired.", visual_cues: ["TV screen", "setup wizard", "network settings"], ai_prompt_hint: "Setup wizard should be visible on the TV screen." },
      { step_number: 8, title: "Configure Kodi", instruction: "Once in Kodi, go to Settings > Media > Library and add your media sources (network shares, USB drives, etc.).", visual_cues: ["Kodi interface", "settings menu", "media sources"], ai_prompt_hint: "Kodi settings menu should be visible on screen." },
      { step_number: 9, title: "Test playback", instruction: "Navigate to Movies or TV Shows, select a file, and verify smooth playback with audio.", visual_cues: ["video playing", "playback controls", "audio indicator"], ai_prompt_hint: "Video should be playing smoothly on the TV." },
    ],
  },
  {
    title: "Wooden Cutting Board",
    description: "Build a beautiful edge-grain cutting board from hardwood strips.",
    category: "craft" as const,
    difficulty: "advanced" as const,
    totalSteps: 11,
    estMinutes: 240,
    isPublic: true,
    thumbnail: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400",
    steps: [
      { step_number: 1, title: "Select and mill wood", instruction: "Choose hardwoods like maple, walnut, and cherry. Mill boards to 3/4 inch thickness and ensure they are flat and square.", visual_cues: ["hardwood boards", "planer", "flat surface"], ai_prompt_hint: "Milled boards should be uniform thickness and flat." },
      { step_number: 2, title: "Cut strips", instruction: "Rip the boards into 1.5 inch wide strips using a table saw with a push stick for safety.", visual_cues: ["table saw", "wood strips", "push stick"], ai_prompt_hint: "Multiple uniform strips should be visible." },
      { step_number: 3, title: "Arrange pattern", instruction: "Lay out the strips in an alternating pattern to create visual contrast. Aim for 10-12 strips for a standard board.", visual_cues: ["arranged strips", "alternating colors", "pattern"], ai_prompt_hint: "Strips should be arranged in an attractive pattern." },
      { step_number: 4, title: "Apply glue", instruction: "Apply wood glue evenly to the edges of each strip using a brush or roller.", visual_cues: ["wood glue", "glue application", "brush"], ai_prompt_hint: "Glue should be visible on the strip edges." },
      { step_number: 5, title: "Clamp strips", instruction: "Align the strips and clamp them together with bar clamps, alternating clamp direction. Tighten evenly and wipe excess glue.", visual_cues: ["bar clamps", "clamped strips", "aligned edges"], ai_prompt_hint: "Strips should be tightly clamped with clamps visible." },
      { step_number: 6, title: "Let dry overnight", instruction: "Allow the glue to cure for at least 8 hours or overnight before removing clamps.", visual_cues: ["clamped board", "workshop setting"], ai_prompt_hint: "Board should remain clamped and undisturbed." },
      { step_number: 7, title: "Remove clamps and flatten", instruction: "Remove clamps and use a planer or belt sander to flatten both faces of the board.", visual_cues: ["planer", "flat board", "wood shavings"], ai_prompt_hint: "Board should be flat with smooth surface." },
      { step_number: 8, title: "Cut to final size", instruction: "Trim the ends square and cut the board to final dimensions (typically 12x18 inches) using a table saw or circular saw.", visual_cues: ["measuring tape", "square edges", "final size"], ai_prompt_hint: "Board should be cut to rectangular shape with square corners." },
      { step_number: 9, title: "Round edges and sand", instruction: "Use a router with a roundover bit to soften all edges. Sand progressively with 80, 120, 180, and 220 grit sandpaper.", visual_cues: ["router", "rounded edges", "sandpaper"], ai_prompt_hint: "Edges should be rounded and surface should be smooth." },
      { step_number: 10, title: "Apply mineral oil", instruction: "Generously apply food-safe mineral oil to all surfaces. Let it soak for 20 minutes, then wipe off excess.", visual_cues: ["mineral oil", "oiled surface", "cloth"], ai_prompt_hint: "Board should have a wet, oiled appearance." },
      { step_number: 11, title: "Apply board cream", instruction: "After the oil dries, apply a mixture of mineral oil and beeswax (board cream) and buff to a satin finish.", visual_cues: ["board cream", "buffing", "finished board"], ai_prompt_hint: "Board should have a smooth, satin finish." },
    ],
  },
];

async function seed() {
  console.log("Seeding projects...");
  
  // First delete all sessions to avoid foreign key constraints
  console.log("Clearing existing sessions...");
  await db.delete(schema.assemblySessions);
  
  // Then delete all projects
  console.log("Clearing existing projects...");
  await db.delete(projects);
  
  // Now insert new projects
  for (const p of seedProjects) {
    await db.insert(projects).values(p);
    console.log(`  ✓ ${p.title}`);
  }
  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
