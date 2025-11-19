const { Router } = require('express');
const { v4: uuid } = require('uuid');
const { z } = require('zod');
const ticketRepository = require('../repositories/ticketRepository');

const router = Router();
const memoryTickets = [];

const TicketSchema = z.object({
  fullName: z.string({ required_error: 'El nombre es obligatorio' }).min(3).max(80),
  email: z.string({ required_error: 'El correo es obligatorio' }).email('Correo no válido'),
  topic: z
    .enum(['backend', 'pwa', 'evaluación', 'otro'], {
      required_error: 'Selecciona un tema',
      invalid_type_error: 'Tema inválido'
    })
    .default('otro'),
  message: z.string({ required_error: 'Describe tu inquietud' }).min(10).max(280)
});

router.get('/', async (req, res, next) => {
  try {
    if (ticketRepository.useDatabase) {
      const data = await ticketRepository.listTickets();
      return res.json({ status: 'ok', total: data.length, data });
    }

    return res.json({ status: 'ok', total: memoryTickets.length, data: memoryTickets });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = TicketSchema.parse(req.body);
    let ticket;

    if (ticketRepository.useDatabase) {
      ticket = await ticketRepository.createTicket(payload);
    } else {
      ticket = { id: uuid(), createdAt: new Date().toISOString(), ...payload };
      memoryTickets.push(ticket);
    }

    res.status(201).json({ status: 'ok', data: ticket });
  } catch (error) {
    error.status = error.status || 422;
    next(error);
  }
});

module.exports = router;
