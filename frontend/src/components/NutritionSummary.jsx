const NutritionSummary = ({ totals }) => (
  <div className="summary-grid">
    <article className="summary-card summary-card-strong">
      <span>Calories</span>
      <strong>{Math.round(totals.calories || 0)}</strong>
      <p>kcal today</p>
    </article>
    <article className="summary-card">
      <span>Protein</span>
      <strong>{Math.round(totals.protein || 0)}g</strong>
      <p>lean recovery</p>
    </article>
    <article className="summary-card">
      <span>Fat</span>
      <strong>{Math.round(totals.fats || 0)}g</strong>
      <p>daily balance</p>
    </article>
    <article className="summary-card">
      <span>Carbs</span>
      <strong>{Math.round(totals.carbs || 0)}g</strong>
      <p>fuel intake</p>
    </article>
  </div>
);

export default NutritionSummary;
