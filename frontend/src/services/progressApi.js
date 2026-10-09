import api from './api'
import tokenStore from './tokenStore'

const STORAGE_KEY = 'algostreamz.progress.v1'

const emptyProgress = () => ({
  completedVisualizers: [],
  masteredChallenges: [],
})

function unique(values) {
  return [...new Set(values)]
}

function readLocalProgress() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return emptyProgress()

  const progress = JSON.parse(stored)
  if (
    !progress ||
    !Array.isArray(progress.completedVisualizers) ||
    !Array.isArray(progress.masteredChallenges)
  ) {
    throw new Error('Saved progress data is invalid.')
  }

  return {
    completedVisualizers: unique(progress.completedVisualizers),
    masteredChallenges: unique(progress.masteredChallenges),
  }
}

function writeLocalProgress(progress) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      completedVisualizers: unique(progress.completedVisualizers),
      masteredChallenges: unique(progress.masteredChallenges),
    }),
  )
}

function addLocalItem(key, itemId) {
  const progress = readLocalProgress()
  progress[key] = unique([...progress[key], itemId])
  writeLocalProgress(progress)
}

function removeLocalItems(key, itemIds) {
  const progress = readLocalProgress()
  progress[key] = progress[key].filter((itemId) => !itemIds.includes(itemId))
  writeLocalProgress(progress)
}

async function sendLocalProgress(progress) {
  await Promise.all([
    ...progress.completedVisualizers.map((algorithmId) =>
      api.post(`/progress/visualizer/${encodeURIComponent(algorithmId)}`),
    ),
    ...progress.masteredChallenges.map((challengeId) =>
      api.post('/progress/challenge', { challengeId }),
    ),
  ])

  removeLocalItems('completedVisualizers', progress.completedVisualizers)
  removeLocalItems('masteredChallenges', progress.masteredChallenges)
}

async function syncLocalProgress() {
  if (!tokenStore.get()) return
  const progress = readLocalProgress()
  if (progress.completedVisualizers.length || progress.masteredChallenges.length) {
    await sendLocalProgress(progress)
  }
}

export const progressApi = {
  getLocalProgress: readLocalProgress,

  hasLocalProgress() {
    const progress = readLocalProgress()
    return progress.completedVisualizers.length > 0 || progress.masteredChallenges.length > 0
  },

  syncLocalProgress,

  async getProgress() {
    if (!tokenStore.get()) return readLocalProgress()
    await syncLocalProgress()
    const { data } = await api.get('/progress')
    if (
      !data ||
      !Array.isArray(data.completedVisualizers) ||
      !Array.isArray(data.masteredChallenges)
    ) {
      throw new Error('The progress service returned an invalid response.')
    }
    return {
      completedVisualizers: unique(data.completedVisualizers),
      masteredChallenges: unique(data.masteredChallenges),
    }
  },

  async completeVisualizer(algorithmId) {
    addLocalItem('completedVisualizers', algorithmId)
    if (!tokenStore.get()) return
    await api.post(`/progress/visualizer/${encodeURIComponent(algorithmId)}`)
    removeLocalItems('completedVisualizers', [algorithmId])
  },

  async completeChallenge(challengeId) {
    addLocalItem('masteredChallenges', challengeId)
    if (!tokenStore.get()) return
    await api.post('/progress/challenge', { challengeId })
    removeLocalItems('masteredChallenges', [challengeId])
  },
}

export default progressApi
