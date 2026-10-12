// 课程数据统一入口（构建时打包进来）
import chapters from '../../../data/chapters.json'
import sources from '../../../data/sources.json'
import principles from '../../../data/principles.json'
import playbooks from '../../../data/playbooks.json'
import skills from '../../../data/skills.json'
import glossary from '../../../data/glossary.json'
export { chapters, sources, principles, playbooks, skills, glossary }
export const sourceMap = Object.fromEntries(sources.map(s => [s.id, s]))
