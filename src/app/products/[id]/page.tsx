type Props = {
  params: { id: string }
} //Define the type of the props

const ProductDetails = ({ params: { id }}: Props ) => {
  return (
    <div>{id}</div>
  )
}

export default ProductDetails