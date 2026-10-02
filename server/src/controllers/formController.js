import prisma from '../lib/prisma.js';
import { generatePublicToken, generateAdminToken } from '../utils/token.js';

/**
 * Create a new feedback form without requiring login or user identity.
 * Generates both a public feedback token and a private admin token.
 * POST /api/forms
 */
export async function createForm(req, res, next) {
  try {
    const { title } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const trimmedTitle = title.trim();

    if (trimmedTitle.length > 200) {
      return res.status(400).json({ error: 'Title cannot exceed 200 characters' });
    }

    // Generate tokens, ensuring uniqueness
    let publicToken = generatePublicToken(8);
    let adminToken = generateAdminToken(32);

    // Collision check loop (extremely rare, but safe)
    let exists = await prisma.form.findFirst({
      where: {
        OR: [{ publicToken }, { adminToken }]
      }
    });

    while (exists) {
      publicToken = generatePublicToken(8);
      adminToken = generateAdminToken(32);
      exists = await prisma.form.findFirst({
        where: {
          OR: [{ publicToken }, { adminToken }]
        }
      });
    }

    const form = await prisma.form.create({
      data: {
        title: trimmedTitle,
        publicToken,
        adminToken
      }
    });

    return res.status(201).json({
      id: form.id,
      title: form.title,
      publicToken: form.publicToken,
      adminToken: form.adminToken
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get public form details for feedback submitters.
 * Returns only public title and token. Never exposes adminToken or feedback entries.
 * GET /api/forms/:publicToken
 */
export async function getPublicForm(req, res, next) {
  try {
    const { publicToken } = req.params;

    if (!publicToken || typeof publicToken !== 'string') {
      return res.status(400).json({ error: 'Invalid feedback link' });
    }

    const form = await prisma.form.findUnique({
      where: { publicToken },
      select: {
        title: true,
        publicToken: true
      }
    });

    if (!form) {
      return res.status(404).json({
        error: 'Feedback page not found. This link may be invalid or no longer available.'
      });
    }

    return res.status(200).json({
      title: form.title,
      publicToken: form.publicToken
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update the title of an existing feedback form using the private adminToken.
 * PATCH/PUT /api/manage/:adminToken
 */
export async function updateForm(req, res, next) {
  try {
    const { adminToken } = req.params;
    const { title } = req.body;

    const trimmedToken = typeof adminToken === 'string' ? adminToken.trim() : '';

    if (!trimmedToken) {
      return res.status(400).json({ error: 'Invalid management link' });
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length > 200) {
      return res.status(400).json({ error: 'Title cannot exceed 200 characters' });
    }

    const existingForm = await prisma.form.findUnique({
      where: { adminToken: trimmedToken }
    });

    if (!existingForm) {
      return res.status(404).json({
        error: 'Management page not found. Check that you are using the correct private link.'
      });
    }

    const updated = await prisma.form.update({
      where: { adminToken: trimmedToken },
      data: { title: trimmedTitle },
      select: {
        title: true,
        publicToken: true
      }
    });

    return res.status(200).json({
      message: 'Feedback page updated successfully',
      form: updated
    });
  } catch (error) {
    next(error);
  }
}

