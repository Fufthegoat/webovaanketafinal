const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const DATA_FILE = path.join(__dirname, "data", "responses.json");

// 🔧 zajistí, že soubor existuje
if (!fs.existsSync(DATA_FILE)) {
  fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });
  fs.writeFileSync(DATA_FILE, "[]");
}

// 🎮 ANKETA
const survey = {
  id: "2",
  title: "Gaming & relax životní styl",
  description: "Jak trávíš volný čas s technologiemi a hrami.",
  questions: [
    {
      id: "q1",
      type: "closed",
      text: "Kolik hodin týdně hraješ hry?",
      options: ["0", "1–5", "6–15", "15–30", "30+"]
    },
    {
      id: "q2",
      type: "closed",
      text: "Na čem hraješ nejčastěji?",
      options: ["PC", "PlayStation", "Xbox", "Mobil", "Nehrávám"]
    },
    {
      id: "q3",
      type: "closed",
      text: "Hraješ spíš sám nebo s ostatními?",
      options: ["Sám", "S přáteli", "Online", "Nehrávám"]
    },
    {
      id: "q4",
      type: "closed",
      text: "Co tě nejvíc relaxuje?",
      options: ["Hry", "Hudba", "Spánek", "Sport", "Sociální sítě"]
    },
    {
      id: "q5",
      type: "open",
      text: "Jakou hru bys doporučil?"
    },
    {
      id: "q6",
      type: "open",
      text: "Co ti hraní her dává?"
    }
  ]
};

// 📂 načtení odpovědí
function loadResponses() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

// 💾 uložení
function saveResponses(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 🏠 home
app.get("/", (req, res) => {
  res.render("index", { survey });
});

// 📝 formulář
app.get("/survey", (req, res) => {
  res.render("survey", { survey });
});

// 📥 odeslání
app.post("/survey", (req, res) => {
  const responses = loadResponses();

  responses.push({
    surveyId: survey.id,
    answers: req.body,
    timestamp: new Date().toISOString()
  });

  saveResponses(responses);

  res.redirect("/results");
});

// 📊 výsledky
app.get("/results", (req, res) => {
  const responses = loadResponses();

  const stats = {};

  survey.questions.forEach(q => {
    stats[q.id] = { type: q.type, data: {} };

    responses.forEach(r => {
      const ans = r.answers[q.id];

      if (q.type === "closed") {
        stats[q.id].data[ans] = (stats[q.id].data[ans] || 0) + 1;
      } else {
        if (!stats[q.id].data.list) stats[q.id].data.list = [];
        stats[q.id].data.list.push(ans);
      }
    });
  });

  res.render("results", {
    survey,
    stats,
    total: responses.length
  });
});

// ▶ start serveru
app.listen(3000, () => {
  console.log("Server běží: http://localhost:3000");
});