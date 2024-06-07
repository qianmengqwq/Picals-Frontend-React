import { FC, useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom'
import type { MenuProps } from 'antd'
import { Menu } from 'antd'
import { PictureOutlined, UserOutlined } from '@ant-design/icons'
import { SearchFilter } from '@/utils/types'
import type { LabelDetailInfo } from '@/utils/types'
import LabelInfo from '@/components/search-result/label-info'
import WorkList from '@/components/search-result/work-list'
import UserList from '@/components/search-result/user-list'
import { getLabelDetailAPI } from '@/apis'
import Empty from '@/components/common/empty'

const items: MenuProps['items'] = [
  {
    label: '插画',
    key: 'work',
    icon: <PictureOutlined />,
  },
  {
    label: '用户',
    key: 'user',
    icon: <UserOutlined />,
  },
]

const SearchResult: FC = () => {
  const navigate = useNavigate()
  const query = useSearchParams()[0]
  const searchFilter: SearchFilter = {
    label: query.get('label') || '',
    type: query.get('type') || 'work',
    sortType: query.get('sortType') || 'new',
  }
  const [current, setCurrent] = useState(searchFilter.type || 'work')
  const [width, setWidth] = useState<number>(1245)
  const exploreRef = useRef<HTMLDivElement>(null)
  const currentWidth = useOutletContext<number>()

  useEffect(() => {
    if (currentWidth < 1305) {
      setWidth(1040)
    } else {
      setWidth(1245)
    }
  }, [currentWidth])

  const checkoutMenu: MenuProps['onClick'] = (e) => {
    navigate({
      search: `?type=${e.key}&label=${searchFilter.label}&sortType=${searchFilter.sortType}`,
    })
  }

  useEffect(() => {
    setCurrent(searchFilter.type || 'work')
  }, [searchFilter.type])

  const [labelDetail, setLabelDetail] = useState<LabelDetailInfo>()

  const getLabelDetail = async () => {
    try {
      const { data } = await getLabelDetailAPI({ name: searchFilter.label })
      if (data) {
        setLabelDetail(data)
      } else {
        setLabelDetail(undefined)
      }
    } catch (error) {
      console.log('出现错误了喵！！', error)
      return
    }
  }

  useEffect(() => {
    getLabelDetail()
  }, [searchFilter.label])

  const likeLabel = () => setLabelDetail((prev) => ({ ...prev!, isMyLike: !prev!.isMyLike }))

  return (
    <div ref={exploreRef} className='relative overflow-hidden w-100% my-30px'>
      <div
        style={{
          width: `${width}px`,
          marginTop: current === 'work' ? '0' : '-210px',
        }}
        className='flex flex-col items-center mx-auto transition-all duration-300 ease-in-out'>
        {labelDetail ? (
          <LabelInfo {...labelDetail} like={likeLabel} />
        ) : (
          <div className='relative w-full h-210px'>
            <Empty showImg={false} text='目前暂未收录该标签哦~' />
          </div>
        )}
        <Menu
          className='w-100%'
          onClick={checkoutMenu}
          selectedKeys={[current]}
          mode='horizontal'
          items={items}
        />
        {current === 'work' ? (
          labelDetail && (
            <WorkList
              labelName={labelDetail.name}
              sortType={searchFilter.sortType}
              workCount={labelDetail.workCount}
            />
          )
        ) : (
          <UserList labelName={searchFilter.label} width={width} />
        )}
      </div>
    </div>
  )
}

export default SearchResult
