const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const { auth } = require('../middleware/auth');

// @route   GET /api/stories
// @desc    Get all stories
// @access  Public
router.get('/', async (req, res) => {
    try {
        const stories = await Story.find()
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });
        res.json(stories);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/stories
// @desc    Create a story
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { title, content, location, rating, media } = req.body;

        const newStory = new Story({
            user: req.user.id,
            title,
            content,
            location,
            rating,
            media
        });

        const story = await newStory.save();
        const populatedStory = await Story.findById(story._id).populate('user', 'name avatar');
        res.json(populatedStory);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/stories/:id
// @desc    Delete a story
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ msg: 'Story not found' });
        }

        // Check user
        if (story.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Story.deleteOne({ _id: req.params.id });
        res.json({ msg: 'Story removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
