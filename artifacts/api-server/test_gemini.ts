import { analyzeStory } from "./src/services/geminiService";

analyzeStory(["Navigating dating in a new city. Moved to a new place and used the app to meet people. It's a wonderful journey so far."])
  .then(res => console.log(JSON.stringify(res, null, 2)))
  .catch(console.error);
