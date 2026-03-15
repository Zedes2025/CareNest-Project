import { Doc } from '#models';
import { type RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';
import { summarizeText } from './DocAnalyzer.ts';

export const getDocs: RequestHandler = async (req, res) => {
  const docs = await Doc.find().lean();
  res.json(docs);
};

export const getDocById: RequestHandler = async (req, res) => {
  // used by frontend to get the details of a specific document, including its summary
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new Error('Invalid document id', { cause: { status: 400 } });
  }

  const doc = await Doc.findById(id).lean();

  if (!doc) {
    throw new Error('Document not found', { cause: { status: 404 } });
  }

  res.json(doc);
};

export const createDoc: RequestHandler = async (req, res) => {
  // used by upload doc by user on frontend:
  const { fileName, text } = req.body;

  if (!fileName || !text) {
    throw new Error('Missing data', { cause: { status: 400 } });
  }

  if (!req.user) {
    throw new Error('User not authenticated', { cause: { status: 401 } });
  }

  // call AI to analyze the text content of the document
  const aiResult = await summarizeText(text); // { summary, deadline, actionRequired }

  const doc = await Doc.create({
    userId: req.user.id,
    fileName,
    summary: aiResult.summary,
    deadline: aiResult.deadline,
    actionRequired: aiResult.actionRequired
  });
  res.status(201).json(doc);
};

export const deleteDoc: RequestHandler = async (req, res) => {
  const {
    params: { id }
  } = req;

  if (!isValidObjectId(id)) {
    throw new Error('Invalid document id', { cause: { status: 400 } });
  }

  const doc = await Doc.findByIdAndDelete(id);
  if (!doc) throw new Error('Document not found', { cause: { status: 404 } });
  console.log('DELETE request params:', req.params);
  res.json({ message: 'User deleted' });
};
