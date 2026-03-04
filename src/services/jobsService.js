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
        salaryType: '時給',
        salaryMin: 1050,
        salaryMax: 1150,
        vacation: 'シフト制',
        startTime: '09:00',
        endTime: '22:00',
        jobDuties: 'ホール業務・キッチン業務',
        createdAt: '2025-01-15',
        description:
          '仕事内容仕事内容仕事内容仕事内容仕事内容仕事内容仕事内容仕事内容仕事内容仕事内容仕事内容仕事内容仕事内容仕事内容',
      },
      {
        id: 2,
        employmentType: 'アルバイト',
        companyName: '△△カフェ',
        title: '【駅チカ】おしゃれカフェスタッフ募集！未経験歓迎',
        location: '和歌山市 / 和歌山駅（徒歩3分）',
        salaryType: '時給',
        salaryMin: 1000,
        salaryMax: 1200,
        vacation: 'シフト制',
        startTime: '08:00',
        endTime: '20:00',
        jobDuties: 'カフェスタッフ',
        createdAt: '2025-01-20',
      },
      {
        id: 3,
        employmentType: 'パート',
        companyName: '□□学習塾',
        title: '【高時給】大学生歓迎！個別指導の塾講師',
        location: '和歌山市 / 紀三井寺駅（徒歩10分）',
        salaryType: '時給',
        salaryMin: 1300,
        salaryMax: 1800,
        vacation: 'シフト制',
        startTime: '14:00',
        endTime: '21:00',
        jobDuties: '個別指導講師',
        createdAt: '2025-01-10',
      },
    ]
    return jobList
  } catch (error) {
    throw new Error(`求人情報の取得に失敗しました: ${error.message}`)
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
