import styled from "styled-components";

const DifficultySelect = styled.select`
   min-height: 40;
   font-size: larger;
   padding: .25rem .5rem;
   margin: 0 .5rem;
`

const Label = styled.label`
   font-size: larger;
`

export function DifficultySelection({ isHardMode, setIsHardMode }) {

   function handleChange(event) {
      switch (event.target.value) {
         case "normal_mode":
            setIsHardMode(false);
            break;
         case "hard_mode":
            setIsHardMode(true);
            break;
      }
   }

   return (
      <Label
         htmlFor="difficulty"
      >
         Difficulty:
         <DifficultySelect
            aria-label="difficulty" id="difficulty"
            onChange={handleChange} value={isHardMode ? "hard_mode" : "normal_mode"} >
            <option value="normal_mode">Normal Mode</option>
            <option value="hard_mode">Hard Mode</option>
         </DifficultySelect>
      </Label>
   )
}