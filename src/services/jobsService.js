import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

const workplaceImages = import.meta.glob('@/assets/workplaces/*.{png,jpg,jpeg,svg}', {
  eager: true,
  import: 'default',
})

const getWorkPlaceImageUrl = (filename) => {
  return workplaceImages[`/src/assets/workplaces/${filename}`]
}

export const getJobs = async () => {
  try {
    // 一時的にハードコーディングされた求人データを返す
    const jobList = [
      {
        id: 1,
        employmentType: 'アルバイト',
        companyName: '〇〇株式会社',
        title: '【週1日〜/1日3h〜】サークルや授業との両立100%可能！急な予定変更も相談に乗ります！',
        location: '和歌山市 / 南海和歌山市駅（徒歩5分）',
        lat: 34.233512, // 緯度
        lng: 135.167814, // 経度
        salaryType: '時給',
        salaryMin: 1050,
        salaryMax: 1150,
        vacation: 'シフト制',
        startTime: '09:00',
        endTime: '22:00',
        workHours: '09:00〜22:00の間で1日3h〜OK',
        workDays: '週1日〜OK',
        jobDuties: 'ホール業務・キッチン業務',
        tags: ['週1OK', '未経験歓迎', '駅チカ', '学生歓迎'],
        createdAt: '2025-01-15',
        description: 'ここに長い文章を入れる',
        media: [
          getWorkPlaceImageUrl('workplace_example1.jpeg'),
          getWorkPlaceImageUrl('workplace_example2.jpeg'),
          getWorkPlaceImageUrl('workplace_example3.jpeg'),
        ],
      },
      {
        id: 2,
        employmentType: 'アルバイト',
        companyName: '△△カフェ',
        title: '【駅チカ】おしゃれカフェスタッフ募集！未経験歓迎',
        location: '和歌山市 / 和歌山駅（徒歩3分）',
        lat: 34.232333,
        lng: 135.191544,
        salaryType: '時給',
        salaryMin: 1000,
        salaryMax: 1200,
        vacation: 'シフト制',
        startTime: '08:00',
        endTime: '20:00',
        workHours: '08:00〜20:00の間で4h〜OK',
        workDays: '週2日〜OK',
        jobDuties: 'カフェスタッフ',
        tags: ['駅チカ', 'カフェバイト', '未経験歓迎'],
        createdAt: '2025-01-20',
        description: 'ここに長い文章を入れる',
        media: [
          getWorkPlaceImageUrl('workplace_example1.jpeg'),
          getWorkPlaceImageUrl('workplace_example2.jpeg'),
          getWorkPlaceImageUrl('workplace_example3.jpeg'),
        ],
      },
      {
        id: 3,
        employmentType: 'パート',
        companyName: '□□学習塾',
        title: '【高時給】大学生歓迎！個別指導の塾講師',
        location: '和歌山市 / 紀三井寺駅（徒歩10分）',
        lat: 34.185623,
        lng: 135.188734,
        salaryType: '時給',
        salaryMin: 1300,
        salaryMax: 1800,
        vacation: 'シフト制',
        startTime: '14:00',
        endTime: '21:00',
        workHours: '14:00〜21:00',
        workDays: '週2〜3日',
        jobDuties: '個別指導講師',
        tags: ['高時給', '塾講師', '大学生歓迎'],
        createdAt: '2025-01-10',
        description:
          'ここに長い文章を入れるここに長い文章を入れるここに長い文章を入れるここに長い文章を入れるここに長い文章を入れるここに長い文章を入れるここに長い文章を入れるここに長い文章を入れるここに長い文章を入れるここに長い文章を入れる',
        media: [
          getWorkPlaceImageUrl('workplace_example1.jpeg'),
          getWorkPlaceImageUrl('workplace_example2.jpeg'),
          getWorkPlaceImageUrl('workplace_example3.jpeg'),
        ],
      },
    ]
    return jobList
  } catch (error) {
    throw new Error(`求人情報の取得に失敗しました: ${error.message}`)
  }
}

/**
 * Firestore から bookmarkedJobIds を取得する関数
 *
 * @param {string} userId - ユーザーID
 * @returns {Promise<Array>} ブックマークされた求人IDの配列
 */
export async function getBookmarkedJobIds(userId) {
  try {
    const docRef = doc(db, `users/${userId}`)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return data.bookmarkedJobIds || [] // 配列を返す（存在しない場合は空配列）
    } else {
      return []
    }
  } catch (error) {
    console.error('Error getting bookmarked jobs: ', error)
    throw error
  }
}

/**
 * Firestore に bookmarkedJobIds を保存・更新する関数
 *
 * @param {string} userId - ユーザーID
 * @param {Array} bookmarkedJobIds - ブックマークされた求人IDの配列
 * @returns {Promise<void>}
 */
export async function updateBookmarkedJobIds(userId, bookmarkedJobIds) {
  try {
    const docRef = doc(db, `users/${userId}`)
    // merge: true にすることで、photoURLなどの他のユーザーデータを上書き消去せずに済む
    await setDoc(docRef, { bookmarkedJobIds }, { merge: true })
  } catch (error) {
    console.error('Error updating bookmarked jobs: ', error)
    throw error
  }
}

export const getJobById = async (id) => {
  try {
    // 一時的にハードコーディングされた求人データからIDで検索して返す
    const jobs = await getJobs()
    const job = jobs.find((job) => job.id === id)
    return job
  } catch (error) {
    throw new Error(`求人情報の取得に失敗しました: ${error.message}`)
  }
}
