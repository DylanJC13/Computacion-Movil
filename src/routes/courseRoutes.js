const { Router } = require('express');
const courses = require('../data/courses');

const router = Router();

const normalize = (value = '') => value.toString().toLowerCase();

router.get('/', (req, res) => {
  const { modality, campus, tag, search } = req.query;

  const filtered = courses.filter((course) => {
    const matchesModality = modality ? normalize(course.modality) === normalize(modality) : true;
    const matchesCampus = campus ? normalize(course.campus) === normalize(campus) : true;
    const matchesTag = tag ? course.tags.map(normalize).includes(normalize(tag)) : true;
    const matchesSearch = search
      ? normalize(course.title).includes(normalize(search)) || normalize(course.summary).includes(normalize(search))
      : true;

    return matchesModality && matchesCampus && matchesTag && matchesSearch;
  });

  res.json({
    status: 'ok',
    total: filtered.length,
    data: filtered
  });
});

router.get('/:courseId', (req, res, next) => {
  const course = courses.find((item) => item.id === req.params.courseId);

  if (!course) {
    const error = new Error('Curso no encontrado');
    error.status = 404;
    return next(error);
  }

  res.json({ status: 'ok', data: course });
});

module.exports = router;
