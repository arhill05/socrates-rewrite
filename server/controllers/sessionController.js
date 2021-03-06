const mongoose = require('mongoose');
const Session = require('../models/Session');

exports.getSessions = async(req, res, next) => {
    try {
        const session = await Session.find().exec();
        return res.json(session);
    } catch (err) {
        next(err);
    }
}

exports.getSessionById = async(req, res, next) => {
    try {
        const session = await Session.findOne({
            id: req.params.id
        });
        return res.json(session);
    } catch (err) {
        next(err);
    }
}

exports.getManySessionsByOwnerUid = async(req, res, next) => {
    try {
        const sessions = await Session.find({
            'ownerUid': req.params.ownerUid
        });
        if (sessions === null) {
            return res.json(null);
        }
        const response = sessions.map(session => {
            return {
                id: session.id,
                description: session.description,
                title: session.title,
                ownerUid: session.ownerUid
            }
        });
        return res.json(response);
    } catch (err) {
        next(err);
    }
}

exports.getSessionMetaById = async(req, res, next) => {
    try {
        const session = await Session.findOne({
            id: req.params.id
        });
        if (session === null) {
            return res.json(null);
        }
        const response = {
            id: session.id,
            description: session.description,
            title: session.title,
            ownerUid: session.ownerUid
        };

        return res.json(response);
    } catch (err) {
        next(err)
    };
}

exports.createSession = async(req, res, next) => {
    try {
        const session = await new Session(req.body).save();
        const response = {
            id: session.id,
            description: session.description,
            title: session.title,
            ownerUid: session.ownerUid
        };
        res.json(response);
    } catch (err) {
        next(err);
    }
}

exports.deleteSession = async(req, res, next) => {
    try {
        const id = req.params.id;
        await Session.remove({id});
        res.json(true);
    } catch (err) {
        next(err);
    }
}