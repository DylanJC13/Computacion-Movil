const { Router } = require('express');
const memoryCourses = require('../data/courses');
const courseRepository = require('../repositories/courseRepository');

const router = Router();

const normalize = (value = '') => value.toString().toLowerCase();

function filterCourses(items, { modality, campus, tag, search }) {
  return items.filter((course) => {
    const matchesModality = modality ? normalize(course.modality) === normalize(modality) : true;
    const matchesCampus = campus ? normalize(course.campus) === normalize(campus) : true;
    const matchesTag = tag ? course.tags.map(normalize).includes(normalize(tag)) : true;
    const matchesSearch = search
      ? normalize(course.title).includes(normalize(search)) || normalize(course.summary).includes(normalize(search))
      : true;

    return matchesModality && matchesCampus && matchesTag && matchesSearch;
  });
}

router.get('/', async (req, res, next) => {
  try {
    const sourceCourses = courseRepository.useDatabase
      ? await courseRepository.listCourses()
      : memoryCourses;
    const filtered = filterCourses(sourceCourses, req.query);

    res.json({
      status: 'ok',
      total: filtered.length,
      data: filtered
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:courseId', async (req, res, next) => {
  try {
    const course = courseRepository.useDatabase
      ? await courseRepository.findCourseById(req.params.courseId)
      : memoryCourses.find((item) => item.id === req.params.courseId);

    if (!course) {
      const err = new Error('Curso no encontrado');
      err.status = 404;
      throw err;
    }

    res.json({ status: 'ok', data: course });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
