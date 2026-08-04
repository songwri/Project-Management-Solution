import { useState, type FormEvent } from 'react'
import { Modal } from './Modal'
import { getAccessToken, setAccessToken } from '../lib/authToken'

export function AccessCodeButton() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setAccessToken(value.trim())
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setValue(getAccessToken() ?? '')
          setOpen(true)
        }}
        className="text-sm font-medium rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-100"
      >
        접속 코드
      </button>
      {open && (
        <Modal title="팀 접속 코드 입력" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-sm text-slate-500">
              저장/수정을 위해 팀에서 공유받은 접속 코드를 입력하세요.
            </p>
            <input
              type="password"
              autoFocus
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                저장
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
