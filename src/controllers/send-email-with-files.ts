import { NextFunction, Response } from "express";
import { IRequestWthRawBody } from "../types/custom-express-types";
import MicrosoftGraphAPI from "../util/microsoft-graph-api";

export default async function sendEmailsWithFilesAttached(req: IRequestWthRawBody, res: Response, next: NextFunction) {
  try {
    const graph = await MicrosoftGraphAPI.build(process.env.TENANT ?? "", process.env.CLIENT_ID ?? "", process.env.CLIENT_SECRET ?? "");

    console.log(req.originalUrl + ": Generating files");

    const bigTextFile =
      'The Evolution of Artificial Intelligence\n\nThe concept of artificial intelligence has fascinated humans for centuries. Long before the advent of modern computers, ancient myths often spoke of machines or beings that possessed human-like intelligence. Ancient Greeks told tales of Talos, an automaton made of bronze, and the Chinese spoke of the mechanical men built by the inventor Yan Shi.\n\n1. Early Beginnings:\n\nThe seeds of modern AI were sown during the 20th century. The British mathematician and logician Alan Turing, often hailed as the father of computer science, introduced the idea of a universal machine \u2013 now known as the Turing machine \u2013 in the 1930s. This theoretical construct laid the foundation for the digital computers we use today. In 1950, Turing famously posed the question, "Can machines think?" and introduced the Turing Test as a measure of machine intelligence.\n\n2. Birth of AI as a Field:\n\nAI as a distinct field emerged in the mid-20th century. In 1956, John McCarthy organized the Dartmouth Conference, where the term "artificial intelligence" was coined. This event marked the birth of AI as an academic discipline. Early AI research focused on problem-solving and symbolic methods. During this period, programs were developed that could, to some extent, play chess, prove mathematical theorems, and understand natural language.\n\n3. AI Winters and Revivals:\n\nThe journey of AI has not been a straightforward path of progress. The field has experienced several \'AI winters\', periods when funding and interest waned due to unmet expectations. The first major AI winter occurred in the 1970s, followed by another in the late 1980s and early 1990s.\n\nHowever, despite these setbacks, the undercurrents of progress never stopped. Every AI winter was followed by a resurgence fueled by technological advancements and novel approaches. Connectionist models, like neural networks, were one such promising approach that faced skepticism initially but later led to significant breakthroughs.\n\n4. The Rise of Deep Learning:\n\nIn the 2000s, with the advent of greater computational power and vast amounts of data, deep learning \u2013 a subfield of machine learning based on neural networks \u2013 began to show its potential. In 2012, a deep neural network achieved a breakthrough in the ImageNet competition, drastically reducing error rates in image classification. This event marked the beginning of the current AI boom, with deep learning models achieving human-level performance in various tasks, from game playing to medical diagnosis.\n\n5. The Present and Future of AI:\n\nToday, AI technologies are integrated into various aspects of daily life, from virtual assistants like Siri and Alexa to recommendation systems on platforms like Netflix and YouTube. The potential applications of AI are vast \u2013 spanning across sectors like healthcare, finance, and transportation.\n\nAs we look to the future, ethical considerations surrounding AI come to the forefront. As AI systems become more integrated into society, issues like bias, transparency, and accountability become paramount. The journey of AI is a testament to human ingenuity and perseverance, and as we move forward, the focus will shift from merely building intelligent systems to building systems that are both intelligent and ethical.\n';
    const toRecipients = req.body.to;
    const from = process.env.ROBOT_EMAIL ?? "";
    const subject = req.body.subject;
    const contentType = req.body.email_content_type;

    const bcc = req.body.bcc ?? true;

    console.log(req.originalUrl + ": Sending email");

    await graph.sendEmail(from, toRecipients, subject, "Here is your attachment", contentType, bcc, [
      {
        "@odata.type": "#microsoft.graph.fileAttachment",
        name: "File name.txt",
        contentType: "text/plain",
        contentBytes: Buffer.from(bigTextFile).toString("base64")
      }
    ]);

    console.log(req.originalUrl + ": Email sent");
    res.status(200).send({
      message: "Success in sending email with attached files",
      status: res.statusCode
    });
  } catch (error) {
    next(error);
  }
}
