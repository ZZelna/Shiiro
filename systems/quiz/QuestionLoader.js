const fs = require("fs");
const path = require("path");

function loadQuestions(category) {

    const file = path.join(
        __dirname,
        "../../quiz/data",
        `${category}.json`
    );

    if (!fs.existsSync(file))
        return [];

    return JSON.parse(
        fs.readFileSync(file, "utf8")
    );

}

function randomQuestion(category) {

    const questions = loadQuestions(category);

    if (!questions.length)
        return null;

    return questions[
        Math.floor(
            Math.random() * questions.length
        )
    ];

}

module.exports = {
    loadQuestions,
    randomQuestion
};
