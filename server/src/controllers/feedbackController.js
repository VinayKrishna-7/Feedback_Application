import prisma from '../lib/prisma.js';

const ALLOWED_CATEGORIES = ['positive', 'improvement', 'general'];

/**
 * Submit anonymous feedback for a given form.
 * POST /api/forms/:publicToken/feedback
 */
export async function submitFeedback(req, res, next) {
  try {
    const { publicToken } = req.params;
    const { message, category } = req.body;

    const trimmedToken = typeof publicToken === 'string' ? publicToken.trim() : '';

    if (!trimmedToken) {
      return res.status(400).json({ error: 'Invalid feedback link' });
    }

    // Verify form exists
    const form = await prisma.form.findUnique({
      where: { publicToken: trimmedToken },
      select: { id: true }
    });

    if (!form) {
      return res.status(404).json({
        error: 'Feedback page not found. This link may be invalid or no longer available.'
      });
    }

    // Validate feedback message
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Feedback message is required' });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 3) {
      return res.status(400).json({ error: 'Feedback message must be at least 3 characters long' });
    }

    if (trimmedMessage.length > 2000) {
      return res.status(400).json({ error: 'Feedback message cannot exceed 2000 characters' });
    }

    // Validate category (optional, but must be in allowed list if provided)
    let validatedCategory = null;
    if (category !== undefined && category !== null && category !== '') {
      if (typeof category !== 'string' || !ALLOWED_CATEGORIES.includes(category.toLowerCase().trim())) {
        return res.status(400).json({
          error: 'Category must be one of: positive, improvement, general'
        });
      }
      validatedCategory = category.toLowerCase().trim();
    }

    // Create feedback without recording IP, user agent, or any identity
    const createdFeedback = await prisma.feedback.create({
      data: {
        formId: form.id,
        message: trimmedMessage,
        category: validatedCategory
      },
      select: {
        id: true,
        message: true,
        category: true,
        createdAt: true
      }
    });

    return res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: createdFeedback
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get private management dashboard data.
 * Protected strictly by the private adminToken.
 * GET /api/manage/:adminToken
 */
export async function getDashboard(req, res, next) {
  try {
    const { adminToken } = req.params;
    const trimmedToken = typeof adminToken === 'string' ? adminToken.trim() : '';

    if (!trimmedToken) {
      return res.status(400).json({ error: 'Invalid management link' });
    }

    const form = await prisma.form.findUnique({
      where: { adminToken: trimmedToken },
      include: {
        feedback: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            message: true,
            category: true,
            createdAt: true
          }
        }
      }
    });

    if (!form) {
      return res.status(404).json({
        error: 'Management page not found. Check that you are using the correct private link.'
      });
    }

    const stats = {
      total: form.feedback.length,
      positive: 0,
      improvement: 0,
      general: 0,
      uncategorized: 0
    };

    for (const item of form.feedback) {
      if (item.category === 'positive') stats.positive += 1;
      else if (item.category === 'improvement') stats.improvement += 1;
      else if (item.category === 'general') stats.general += 1;
      else stats.uncategorized += 1;
    }

    // Do NOT return the adminToken in the response body
    return res.status(200).json({
      form: {
        title: form.title,
        publicToken: form.publicToken
      },
      stats,
      feedback: form.feedback
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete an individual feedback response.
 * Verifies that the feedback belongs strictly to the form matching the adminToken.
 * DELETE /api/manage/:adminToken/feedback/:feedbackId
 */
export async function deleteFeedback(req, res, next) {
  try {
    const { adminToken, feedbackId } = req.params;

    if (!adminToken || typeof adminToken !== 'string') {
      return res.status(400).json({ error: 'Invalid management link' });
    }

    const parsedId = parseInt(feedbackId, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: 'Invalid feedback ID' });
    }

    const form = await prisma.form.findUnique({
      where: { adminToken },
      select: { id: true }
    });

    if (!form) {
      return res.status(404).json({
        error: 'Management page not found. Check that you are using the correct private link.'
      });
    }

    const feedback = await prisma.feedback.findUnique({
      where: { id: parsedId }
    });

    // Make sure feedback exists and belongs to this specific form
    if (!feedback || feedback.formId !== form.id) {
      return res.status(404).json({
        error: 'Feedback not found or does not belong to this form'
      });
    }

    await prisma.feedback.delete({
      where: { id: parsedId }
    });

    return res.status(200).json({
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
