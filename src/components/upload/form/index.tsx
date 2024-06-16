import { FC, useEffect, useState } from 'react'
import type { UploadWorkFormInfo } from '@/utils/types'
import { Form, FormProps, Input, Radio, Select, message } from 'antd'
import { getLabelsInPagesAPI } from '@/apis'

type UploadFormProps = {
  formInfo: UploadWorkFormInfo
  setFormInfo: React.Dispatch<React.SetStateAction<UploadWorkFormInfo>>
  submitTrigger: number
  uploadWork: () => void
}

const wrapperStyle = 'relative bg-#fff w-155 p-5 rd-6 mb-5'
const titleStyle = 'font-size-20px font-bold color-#6d757a mb-5'
const labelStyle = 'font-size-16px font-bold color-#3d3d3d'

const { TextArea } = Input

const Label: FC<{ text: string }> = ({ text }) => {
  return (
    <div className={labelStyle}>
      <span>{text}</span>
    </div>
  )
}

const UploadForm: FC<UploadFormProps> = ({ formInfo, setFormInfo, submitTrigger, uploadWork }) => {
  const [labels, setLabels] = useState<{ value: string; label: string }[]>([])

  const getLabels = async () => {
    try {
      const { data } = await getLabelsInPagesAPI({ pageSize: 100, current: 1 })
      setLabels(data.map((item) => ({ value: item.name, label: item.name })))
    } catch (error) {
      console.log('出现错误了喵！！', error)
      return
    }
  }

  useEffect(() => {
    getLabels()
  }, [])

  const [messageApi, contextHolder] = message.useMessage()
  const [workForm] = Form.useForm()

  const submitWork: FormProps<UploadWorkFormInfo>['onFinish'] = () => uploadWork()

  const handleFailed: FormProps<UploadWorkFormInfo>['onFinishFailed'] = () => {
    messageApi.error('检查一下表单是否填写完整！')
  }

  const handleSelectLabel = (value: string[]) => {
    setFormInfo((prevFormInfo) => ({
      ...prevFormInfo,
      labels: value,
    }))
  }

  const changeReprinted = (value: number) => {
    setFormInfo((prevFormInfo) => ({
      ...prevFormInfo,
      basicInfo: {
        ...prevFormInfo.basicInfo,
        reprintType: value,
      },
    }))
    if (value) {
      setFormInfo((prevFormInfo) => ({
        ...prevFormInfo,
        illustratorInfo: {
          name: '',
          homeUrl: '',
        },
      }))
    } else {
      setFormInfo((prevFormInfo) => {
        const { illustratorInfo: _, ...rest } = prevFormInfo
        return rest
      })
    }
  }

  useEffect(() => {
    if (submitTrigger === 0) return
    workForm.submit()
  }, [submitTrigger])

  return (
    <>
      {contextHolder}
      <Form
        name='workForm'
        form={workForm}
        size='large'
        labelAlign='left'
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        initialValues={formInfo}
        onFinish={submitWork}
        onFinishFailed={handleFailed}
        autoComplete='off'>
        <div className={wrapperStyle}>
          <div className={titleStyle}>
            <span>基本信息填写</span>
          </div>

          <Form.Item<UploadWorkFormInfo>
            label={<Label text='作品名称' />}
            name={['basicInfo', 'name']}
            rules={[{ required: true, message: '请输入作品名称哦~' }]}>
            <Input
              placeholder='请输入作品名称'
              showCount
              maxLength={64}
              value={formInfo.basicInfo.name}
              onChange={(e) =>
                setFormInfo({
                  ...formInfo,
                  basicInfo: { ...formInfo.basicInfo, name: e.target.value },
                })
              }
            />
          </Form.Item>

          <Form.Item<UploadWorkFormInfo>
            label={<Label text='作品简介' />}
            name={['basicInfo', 'intro']}
            rules={[{ required: true, message: '请输入作品简介' }]}>
            <TextArea
              placeholder='请输入简介~不超过1024个字哦！'
              showCount
              maxLength={1024}
              autoSize={{ minRows: 4, maxRows: 8 }}
              value={formInfo.basicInfo.intro}
              onChange={(e) =>
                setFormInfo({
                  ...formInfo,
                  basicInfo: { ...formInfo.basicInfo, intro: e.target.value },
                })
              }
            />
          </Form.Item>

          <Form.Item<UploadWorkFormInfo>
            label={<Label text='是否转载' />}
            name={['basicInfo', 'reprintType']}
            rules={[{ required: true, message: '请选择是否转载作品！' }]}>
            <Radio.Group
              value={formInfo.basicInfo.reprintType}
              onChange={(event) => changeReprinted(event.target.value)}>
              <Radio value={2}>合集作品</Radio>
              <Radio value={1}>转载作品</Radio>
              <Radio value={0}>原创作品</Radio>
            </Radio.Group>
          </Form.Item>

          {formInfo.basicInfo.reprintType !== 0 && (
            <>
              {formInfo.basicInfo.reprintType === 1 && (
                <Form.Item<UploadWorkFormInfo>
                  label={<Label text='作品URL' />}
                  name={['basicInfo', 'workUrl']}
                  rules={[
                    { required: true, message: '请输入收藏作品的源地址！' },
                    { type: 'url', message: '请输入正确的URL地址！' },
                  ]}>
                  <Input
                    placeholder='请输入收藏作品的源地址'
                    value={formInfo.basicInfo.workUrl}
                    onChange={(e) =>
                      setFormInfo({
                        ...formInfo,
                        basicInfo: { ...formInfo.basicInfo, workUrl: e.target.value },
                      })
                    }
                  />
                </Form.Item>
              )}

              <Form.Item<UploadWorkFormInfo>
                label={<Label text='原作者名' />}
                name={['illustratorInfo', 'name']}
                rules={[{ required: true, message: '请输入原作者的名称！' }]}>
                <Input
                  placeholder='请输入您收藏原作品的原作者名称'
                  value={formInfo.basicInfo.name}
                  onChange={(e) =>
                    setFormInfo({
                      ...formInfo,
                      illustratorInfo: { ...formInfo.illustratorInfo!, name: e.target.value },
                    })
                  }
                />
              </Form.Item>

              <Form.Item<UploadWorkFormInfo>
                label={<Label text='作者主页' />}
                name={['illustratorInfo', 'homeUrl']}
                rules={[
                  { required: true, message: '请输入原作者的主页url地址！' },
                  { type: 'url', message: '请输入正确的URL地址！' },
                ]}>
                <Input
                  placeholder='原作者主页，如Pixiv作者的主页'
                  value={formInfo.basicInfo.name}
                  onChange={(e) =>
                    setFormInfo({
                      ...formInfo,
                      illustratorInfo: { ...formInfo.illustratorInfo!, homeUrl: e.target.value },
                    })
                  }
                />
              </Form.Item>
            </>
          )}
        </div>

        <div className={wrapperStyle}>
          <div className={titleStyle}>
            <span>作品标签添加</span>
          </div>
          <Form.Item<UploadWorkFormInfo>
            label={<Label text='作品标签' />}
            name='labels'
            rules={[{ required: true, message: '作品标签是必须要选的！' }]}>
            <Select
              mode='tags'
              style={{ width: '100%' }}
              placeholder='选择不超过10个标签，或者自己输入'
              maxCount={10}
              onChange={handleSelectLabel}
              options={labels}
            />
          </Form.Item>
        </div>

        <div className={wrapperStyle}>
          <div className={titleStyle}>
            <span>其他信息</span>
          </div>
          <Form.Item<UploadWorkFormInfo>
            label={<Label text='开启评论' />}
            name={['basicInfo', 'openComment']}
            rules={[{ required: true, message: '请选择是否开启评论！' }]}>
            <Radio.Group
              value={formInfo.basicInfo.openComment}
              onChange={(e) =>
                setFormInfo({
                  ...formInfo,
                  basicInfo: { ...formInfo.basicInfo, openComment: e.target.value },
                })
              }>
              <Radio value={true}>是</Radio>
              <Radio value={false}>否</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item<UploadWorkFormInfo>
            label={<Label text='AI生成作品' />}
            name={['basicInfo', 'isAIGenerated']}
            rules={[{ required: true, message: '请选择是否为AI生成作品！' }]}>
            <Radio.Group
              value={formInfo.basicInfo.isAIGenerated}
              onChange={(e) =>
                setFormInfo({
                  ...formInfo,
                  basicInfo: { ...formInfo.basicInfo, isAIGenerated: e.target.value },
                })
              }>
              <Radio value={true}>是</Radio>
              <Radio value={false}>否</Radio>
            </Radio.Group>
          </Form.Item>
        </div>

        <div className={wrapperStyle}>
          <div className={titleStyle}>
            <span>其他须知</span>
          </div>
          <div className='flex flex-col gap-10px font-size-14px font-bold color-#3d3d3d line-height-normal'>
            <span>
              这个小站只是因纯粹的热爱而搭建，大家所上传的图片全部都会在后台管理系统进行审核，通过后会在本站进行展示。
            </span>
            <span>包含以下要素的作品将不予上传：</span>
            <ul className='flex flex-col m-0 pl-5 gap-10px'>
              <li>
                <span>现实世界的照片（这是二次元，二次元，二次元）；</span>
              </li>
              <li>
                <span>转载时，原作者明确要求不能转载的；</span>
              </li>
              <li>
                <span>
                  他人制作的作品，发售中的商品图像，第三者持有权利的图像，游戏、视频作品的截图，包含屏幕截图图像的作品。
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Form>
    </>
  )
}

export default UploadForm
