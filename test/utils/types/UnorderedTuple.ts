type CalculatePermutations<U extends string, ResultT extends unknown[] = []> = {
  [k in U]: (
    [Exclude<U, k>] extends [never] ?
      [...ResultT, k] :
      CalculatePermutations<Exclude<U, k>, [...ResultT, k]>
  )
}[U];

type UnorderedTuple<U extends string> = CalculatePermutations<U>;

export default UnorderedTuple;
