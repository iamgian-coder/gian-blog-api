const faker = require("faker");

faker.locale = "zh_CN";

const generateArticlesData = (n = 1000) => {
  let articleData = [];
  let i = 0;

  while (i < n) {
    const title = faker.lorem.sentences(1);
    const postAt = faker.date.past();
    const tags = [
      faker.random.word(faker.random.number({ min: 2, max: 4 })),
      faker.random.word(faker.random.number({ min: 2, max: 4 })),
      faker.random.word(faker.random.number({ min: 2, max: 4 })),
      faker.random.word(faker.random.number({ min: 2, max: 4 })),
    ];
    const views = faker.random.number({ min: 1, max: 10000 });
    const liked = faker.random.number({ min: 1, max: 5000 });
    const markdown = `# ${faker.lorem.lines(5)}\r\n## ${faker.lorem.lines(
      1
    )}\r\n${faker.lorem.paragraph(
      15
    )}\r\n> Never too old to learn\r\n>> Anything is possible\r\n>>> How many levels can you take\r\n### How about some code?\r\n\`\`\`js\r\n(()=>{console.log('This is an arrow function')})();\r\n\r\nconsole.log('123');\r\n\r\n(function(){console.log('This is an normal functon')})()\r\n\`\`\`\r\n${faker.lorem.paragraphs(
      3,
      "\r\n"
    )}`;
    const isPublished = true;
    const isDeleted = false;

    const article = {
      title,
      postAt,
      markdown,
      tags,
      views,
      liked,
      isPublished,
      isDeleted,
    };

    articleData.push(article);
    i++;
  }

  return articleData;
};

module.exports = {
  generateArticlesData,
};
