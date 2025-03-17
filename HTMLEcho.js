class HTMLEcho {
  #source;
  #sourceText;
  #config = {
    lengths: {
      'para': 3,
      'minHeading': 15,
      'maxHeading': 60,
      'minList': 20,
      'maxList': 80
    }
  };


  constructor(textFile) {
    this.#source = textFile;
    this.#sourceText = "";

    this.textLoaded = this.loadText();
  }

  async loadText() {
    const response = await fetch(this.#source);
    this.#sourceText = await response.text();
    this.#sourceText = this.#sourceText.replace(/ \t/g, " ").trim();
  }

  #getRandomSentences(sentenceCount) {
    const sentences = this.#sourceText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);
    if (sentences.length === 0) return "";

    let output = [];
    for (let i = 0; i < sentenceCount; i++) {
      let sentence = sentences[Math.floor(Math.random() * sentences.length)];
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
      output.push(sentence);
    }
    return output.join(" ");
  }

  async generateHTML(structure = "p-5") {
    await this.textLoaded;

    if (!this.#sourceText) {
      const outputElem = document.getElementById("output");
      if (outputElem)
        outputElem.innerHTML = "Loading text... Try again in a moment.";
      return "";
    }

    const tagMap = {
      p: (count) =>
        Array.from(
          { length: count },
          () => `<p>${this.#getRandomSentences(this.#config.lengths.para)}</p>`
        ).join(""),
      ol: (count) => `<ol>${this.#generateListItems(count)}</ol>`,
      ul: (count) => `<ul>${this.#generateListItems(count)}</ul>`,
      h: (level, count) =>
        Array.from(
          { length: count },
          () => {
            const validLevel = Math.max(1, Math.min(6, level));
            return `<h${validLevel}>${this.#getSentenceWithLength(this.#config.lengths.minHeading, this.#config.lengths.maxHeading)}</h${validLevel}>`;
          }
        ),
    };

    return structure
      .split(",")
      .map((item) => {
        const [tag, count] = item.split("-");

        if (tag.startsWith("h")) {
          const level = parseInt(tag.substring(1), 10) || 2;
          return tagMap.h(level, parseInt(count, 10) || 1);
        }

        return tagMap[tag] ? tagMap[tag](parseInt(count, 10)) : "";
      })
      .join("");
  }

  setConfig(options = {}) {

    if (options.lengths) {
      Object.keys(options.lengths).forEach((key) => {
        if (typeof options.lengths[key] !== "number") {
          console.warn(`Ignoring invalid config value for ${key}: Expected a number.`);
          delete options.lengths[key];
        }
      });
    }

    this.#config = {
      ...this.#config,
      ...options,
      lengths: {
        ...this.#config.lengths,
        ...(options.lengths || {})
      }
    };
  }

  #generateListItems(count) {
    return Array.from(
      { length: count },
      () => `<li>${this.#getSentenceWithLength(this.#config.lengths.minList, this.#config.lengths.maxList)}</li>`
    ).join("");
  }

  #getSentenceWithLength(min, max) {
    let sentence, attempts = 0;
    const maxAttempts = 100;

    do {
      sentence = this.#getRandomSentences(1);
      attempts++;
    } while ((sentence.length < min || sentence.length > max) && attempts < maxAttempts);

     return sentence.length >= min && sentence.length <= max ? sentence : "I couldn't get anything.";
  }
}
